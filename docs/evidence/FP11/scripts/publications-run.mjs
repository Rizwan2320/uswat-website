/**
 * FP-12: the publications queue driven in Chromium (virtual authenticator) against the running app.
 * Env: ORIGIN, EMAIL1, EMAIL2, PASSWORD, DBURL (read-only checks of ids), OUT, SHOTS.
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, EMAIL1, EMAIL2, PASSWORD, DBURL, OUT, SHOTS } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const sql = (q) => execFileSync('psql', [DBURL, '-tAc', q]).toString().trim()
const browser = await chromium.launch()

async function signedIn(email, viewport) {
  const ctx = await browser.newContext(viewport ? { viewport } : {})
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } })
  await page.goto(ORIGIN + '/portal/sign-in')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in with password' }).click()
  await page.waitForURL('**/portal/enrol', { timeout: 15000 })
  await page.getByRole('button', { name: 'Add a passkey' }).click()
  await page.getByText('Your passkey is saved.').waitFor({ timeout: 15000 })
  await page.getByRole('button', { name: 'Get my recovery codes' }).click()
  await page.getByRole('list', { name: 'Save your recovery codes' }).waitFor()
  await page.getByLabel('I have saved these codes').check()
  await page.getByRole('button', { name: 'Continue to the portal' }).click()
  await page.waitForURL('**/portal', { timeout: 15000 })
  return { ctx, page }
}
const msg = (page, text) => page.getByTestId('pub-message').filter({ hasText: text }).waitFor({ timeout: 10000 })
const count = (page, testid) => page.getByTestId(testid).locator('li.pub-item').count()
// The message appears before the list refreshes, so wait for the count instead of reading it at once.
async function waitCount(page, testid, n) {
  for (let i = 0; i < 50; i++) { if ((await count(page, testid)) === n) return n; await page.waitForTimeout(100) }
  return count(page, testid)
}
async function saveOrcid(page) {
  await page.goto(ORIGIN + '/portal/profile')
  await page.getByLabel('ORCID iD').fill('0000-0002-1825-0097')
  await page.getByRole('button', { name: 'Save draft' }).click()
  await page.getByTestId('profile-message').filter({ hasText: 'Draft saved.' }).waitFor({ timeout: 10000 })
}

{
  const ctx = await browser.newContext(); const page = await ctx.newPage()
  await page.goto(ORIGIN + '/portal/publications')
  rec('Q0 a signed-out visitor is sent to sign-in', new URL(page.url()).pathname === '/portal/sign-in', page.url())
  await ctx.close()
}

const A = await signedIn(EMAIL1)
const page = A.page
await page.getByRole('link', { name: 'Review your publications' }).click()
await page.waitForURL('**/portal/publications')
rec('Q1 without an ORCID iD the page says so and the harvest button is disabled', (await page.getByRole('button', { name: 'Look for new works' }).isDisabled()) && (await page.getByText('Add your ORCID iD to your profile first.').count()) > 0 && (await page.getByRole('heading', { level: 1 }).count()) === 1 && (await page.getByRole('heading', { level: 1 }).textContent()).includes('Sample'), 'orcid needed')

await saveOrcid(page)
await page.goto(ORIGIN + '/portal/publications')
await page.getByRole('button', { name: 'Look for new works' }).click()
await msg(page, 'Found 5 new works. 2 already known, 2 skipped')
rec('Q2 the first harvest adds 5 works, recognises 2 repeats and drops 2 broken records', (await waitCount(page, 'pub-section-pending', 5)) === 5, 'five pending')
rec('Q3 the Urdu work is shown and its title is direction-aware', (await page.locator('strong[dir=auto]', { hasText: 'نمونہ مقالہ' }).count()) === 1, 'urdu title')
await page.getByRole('button', { name: 'Look for new works' }).click()
await msg(page, 'Found 0 new works. 7 already known')
rec('Q4 harvesting again adds nothing', (await count(page, 'pub-section-pending')) === 5, 'still five')

// claim the first
const firstTitle = await page.getByTestId('pub-pending').first().locator('strong').innerText()
await page.getByTestId('pub-pending').first().getByRole('button', { name: 'This is mine' }).click()
await msg(page, 'Marked as yours.')
rec('Q5 claiming moves it to Claimed', (await waitCount(page, 'pub-section-claimed', 1)) === 1 && (await waitCount(page, 'pub-section-pending', 4)) === 4 && (await page.getByTestId('pub-section-claimed').innerText()).includes(firstTitle), firstTitle)

// capture a real claim request for the crafted test
let claimReq = null
page.on('request', (r) => { if (r.method() === 'POST' && r.headers()['next-action'] && /^\["[0-9a-f-]{36}"\]$/.test(r.postData() ?? '')) claimReq = { url: r.url(), headers: r.headers() } })

// reject the soil work ("not me")
const soil = page.getByTestId('pub-pending').filter({ hasText: 'soil chemistry' })
await soil.getByRole('button', { name: 'Not me' }).click()
await msg(page, 'Marked as not yours.')
rec('Q6 "not me" moves it to Not mine', (await waitCount(page, 'pub-section-rejected', 1)) === 1, 'rejected')
await page.getByRole('button', { name: 'Look for new works' }).click()
await msg(page, 'Found 0 new works')
rec('Q7 the rejected work does not come back after another harvest', (await count(page, 'pub-section-rejected')) === 1 && (await page.getByTestId('pub-section-pending').getByText('soil chemistry').count()) === 0, 'stays rejected')

// duplicate
const water = page.getByTestId('pub-pending').first()
const waterTitle = await water.locator('strong').innerText()
await water.getByLabel('Duplicate of').selectOption({ index: 1 })
await water.getByRole('button', { name: 'Mark as duplicate' }).click()
await msg(page, 'Marked as a duplicate.')
rec('Q8 a duplicate is listed with the work it repeats', (await waitCount(page, 'pub-section-duplicate', 1)) === 1 && (await page.getByTestId('pub-section-duplicate').innerText()).includes(`Repeats: ${firstTitle}`), waterTitle)
rec('Q9 the duplicate button stays disabled until a work is chosen', await (async () => { const next = page.getByTestId('pub-pending').first(); return next.getByRole('button', { name: 'Mark as duplicate' }).isDisabled() })(), 'disabled')

// B's account, B's works
const B = await signedIn(EMAIL2)
await saveOrcid(B.page)
await B.page.goto(ORIGIN + '/portal/publications')
rec('Q10 a second account starts with an empty list (nothing of A\'s decisions)', (await count(B.page, 'pub-section-pending')) === 0 && (await count(B.page, 'pub-section-claimed')) === 0, 'B empty')
await B.page.getByRole('button', { name: 'Look for new works' }).click()
await msg(B.page, 'Found 5 new works')
rec('Q11 the same works are found separately for B (5 pending, none claimed or rejected)', (await waitCount(B.page, 'pub-section-pending', 5)) === 5 && (await count(B.page, 'pub-section-rejected')) === 0, 'B has own five')

// crafted: A replays a claim with one of B's ids
const bId = sql(`select id from identity.publication_candidate where "userId" = (select id from identity."user" where email = '${EMAIL2}') and status = 'pending' limit 1`)
if (claimReq && bId) {
  const res = await page.request.post(claimReq.url, { headers: { 'content-type': claimReq.headers['content-type'] ?? 'text/plain;charset=UTF-8', 'next-action': claimReq.headers['next-action'], accept: 'text/x-component' }, data: JSON.stringify([bId]) })
  const text = await res.text()
  const still = sql(`select status from identity.publication_candidate where id = '${bId}'`)
  rec("Q12 A's crafted decision on B's work is refused and B's work is unchanged", /"error":"nothing"/.test(text) && still === 'pending', `${text.slice(0, 90).replace(/\s+/g, ' ')} | status ${still}`)
  const bad = await page.request.post(claimReq.url, { headers: { 'content-type': claimReq.headers['content-type'] ?? 'text/plain;charset=UTF-8', 'next-action': claimReq.headers['next-action'], accept: 'text/x-component' }, data: JSON.stringify(["x'; drop table identity.publication_candidate;--"]) })
  rec('Q13 a malformed id is refused as invalid', /"error":"invalid"/.test(await bad.text()) && sql(`select count(*) from identity.publication_candidate`) !== '0', 'invalid id')
} else rec('Q12 crafted decision', false, `could not capture (claimReq ${!!claimReq}, bId ${bId})`)
await B.ctx.close()

// keyboard only
await page.goto(ORIGIN + '/portal/publications')
await page.getByRole('button', { name: 'Look for new works' }).focus()
let reached = false
for (let i = 0; i < 20 && !reached; i++) {
  await page.keyboard.press('Tab')
  reached = await page.evaluate(() => document.activeElement?.textContent?.trim() === 'This is mine')
}
const before = await count(page, 'pub-section-claimed')
await page.keyboard.press('Enter')
await msg(page, 'Marked as yours.')
rec('Q14 a work can be claimed by keyboard alone', reached && (await waitCount(page, 'pub-section-claimed', before + 1)) === before + 1, 'keyboard')
await page.screenshot({ path: `${SHOTS}/publications-desktop.png`, fullPage: true })
await A.ctx.close()

{
  const ph = await signedIn(EMAIL1.replace('a@', 'c@'), { width: 390, height: 800 })
  await saveOrcid(ph.page)
  await ph.page.goto(ORIGIN + '/portal/publications')
  await ph.page.getByRole('button', { name: 'Look for new works' }).click()
  await msg(ph.page, 'Found 5 new works')
  const overflow = await ph.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  rec('Q15 no horizontal scroll at 390 px wide with works listed', overflow <= 0, `overflow ${overflow}px`)
  await ph.page.screenshot({ path: `${SHOTS}/publications-phone.png`, fullPage: true })
  await ph.ctx.close()
}
fs.writeFileSync(OUT, JSON.stringify(results, null, 2))
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
