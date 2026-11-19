/**
 * FP-30: the courses screen driven in Chromium (virtual authenticator) against the running app.
 * Env: ORIGIN, EMAIL1, EMAIL2, EMAIL3, PASSWORD, DBURL, OUT, SHOTS.
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, EMAIL1, EMAIL2, EMAIL3, PASSWORD, DBURL, OUT, SHOTS } = process.env
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
const msg = (page, text) => page.getByTestId('course-message').filter({ hasText: text }).waitFor({ timeout: 10000 })
const items = (page) => page.getByTestId('course-item')
async function waitCount(page, n) {
  for (let i = 0; i < 50; i++) { if ((await items(page).count()) === n) return n; await page.waitForTimeout(100) }
  return items(page).count()
}
async function fill(page, { code, title, season, year, programme }) {
  await page.getByLabel('Course code').fill(code)
  await page.getByLabel('Course title').fill(title)
  if (season) await page.getByLabel('Semester').selectOption(season)
  if (year) await page.getByLabel('Year').fill(year)
  await page.getByLabel('Programme (optional)').fill(programme ?? '')
}

{
  const ctx = await browser.newContext(); const page = await ctx.newPage()
  await page.goto(ORIGIN + '/portal/courses')
  rec('R0 a signed-out visitor is sent to sign-in', new URL(page.url()).pathname === '/portal/sign-in', page.url())
  await ctx.close()
}

const A = await signedIn(EMAIL1)
const page = A.page
await page.getByRole('link', { name: 'List the courses you teach' }).click()
await page.waitForURL('**/portal/courses')
rec('R1 one h1 with the Sample badge, an empty list message and the sample note', (await page.getByRole('heading', { level: 1 }).count()) === 1 && (await page.getByRole('heading', { level: 1 }).textContent()).includes('Sample') && (await page.getByText('You have not added any courses yet.').count()) === 1 && (await page.getByRole('note').count()) >= 1, await page.title())

let addReq = null, removeReq = null
page.on('request', (r) => {
  if (r.method() !== 'POST' || !r.headers()['next-action']) return
  const d = r.postData() ?? ''
  if (d.includes('"code"')) addReq = { url: r.url(), headers: r.headers() }
  else if (/^\["[0-9a-f-]{36}"\]$/.test(d)) removeReq = { url: r.url(), headers: r.headers() }
})

await fill(page, { code: 'sam 101', title: 'Sample Course One', season: 'Fall', year: '2026', programme: 'Sample Programme' })
await page.getByRole('button', { name: 'Add course' }).click()
await msg(page, 'Course added.')
rec('R2 a valid course is added (code upper-cased) and the form is cleared', (await waitCount(page, 1)) === 1 && (await items(page).first().innerText()).includes('SAM 101') && (await page.getByLabel('Course code').inputValue()) === '', 'added')

await fill(page, { code: 'SAM 101', title: 'Again', season: 'Fall', year: '2026' })
await page.getByRole('button', { name: 'Add course' }).click()
await msg(page, 'You already listed that course for that semester.')
rec('R3 the same code in the same semester is refused with a message', (await items(page).count()) === 1, 'duplicate')

await fill(page, { code: 'x', title: 'Bad code', season: 'Fall', year: '20x6' })
await page.getByRole('button', { name: 'Add course' }).click()
await page.getByTestId('course-message').filter({ hasText: 'Some fields need attention.' }).waitFor({ timeout: 10000 })
const codeField = page.getByLabel('Course code')
const codeId = await codeField.getAttribute('id')
rec('R4 a bad code and a bad year are refused with linked messages', (await codeField.getAttribute('aria-invalid')) === 'true' && (await page.locator(`#${codeId}-err`).innerText()).includes('not valid') && (await page.getByLabel('Year').getAttribute('aria-invalid')) === 'true' && (await page.getByRole('alert').filter({ hasText: 'Semester' }).count()) > 0, 'aria-invalid set')

await fill(page, { code: 'SAM 101', title: 'نمونہ کورس ایک', season: 'Spring', year: '2027' })
await page.getByRole('button', { name: 'Add course' }).click()
await msg(page, 'Course added.')
await waitCount(page, 2)
await fill(page, { code: 'SAM 090', title: 'Older course', season: 'Winter', year: '2025' })
await page.getByRole('button', { name: 'Add course' }).click()
await waitCount(page, 3)
const texts = await items(page).allInnerTexts()
rec('R5 courses list newest semester first; an Urdu title is kept and direction-aware', texts[0].includes('Spring 2027') && texts[1].includes('Fall 2026') && texts[2].includes('Winter 2025') && texts[0].includes('نمونہ کورس ایک') && (await page.locator('strong[dir=auto]', { hasText: 'نمونہ' }).count()) === 1, texts.map((t) => t.split('\n')[1]).join(' | '))
await page.screenshot({ path: `${SHOTS}/courses-desktop.png`, fullPage: true })

// B: own course
const B = await signedIn(EMAIL2)
await B.page.goto(ORIGIN + '/portal/courses')
rec('R6 a second account starts with an empty list', (await items(B.page).count()) === 0, 'B empty')
await fill(B.page, { code: 'BEE 1', title: 'B course', season: 'Fall', year: '2026' })
await B.page.getByRole('button', { name: 'Add course' }).click()
await waitCount(B.page, 1)
const bId = sql(`select id from identity.course_taught where "userId" = (select id from identity."user" where email = '${EMAIL2}') limit 1`)

// crafted requests from A
const send = async (req, body) => (await page.request.post(req.url, { headers: { 'content-type': req.headers['content-type'] ?? 'text/plain;charset=UTF-8', 'next-action': req.headers['next-action'], accept: 'text/x-component' }, data: JSON.stringify(body) })).text()

// remove one of A's own through the UI, capturing the real remove request
await page.getByRole('button', { name: 'Remove SAM 090, Winter 2025' }).click()
await msg(page, 'Course removed.')
rec('R7 removing a course by its labelled button removes it', (await waitCount(page, 2)) === 2 && !(await page.getByTestId('course-list').innerText()).includes('SAM 090'), 'removed')

if (addReq && removeReq && bId) {
  const t1 = await send(addReq, [{ code: 'HAX 1', title: 'x', season: 'Fall', year: 2026, programme: '', userId: 'someone-else' }])
  rec('R8 a crafted add carrying another account id is refused', /"form":"unknown"/.test(t1), t1.slice(0, 120).replace(/\s+/g, ' '))
  const t2 = await send(removeReq, [bId])
  const still = sql(`select count(*) from identity.course_taught where id = '${bId}'`)
  rec("R9 a crafted remove of B's course is refused and B's course is unchanged", /"error":"nothing"/.test(t2) && still === '1', `${t2.slice(0, 90).replace(/\s+/g, ' ')} | rows ${still}`)
  const t3 = await send(removeReq, ["x'; drop table identity.course_taught;--"])
  rec('R10 a malformed id is refused as invalid', /"error":"invalid"/.test(t3) && sql('select count(*) from identity.course_taught') !== '0', 'invalid')
} else rec('R8 crafted requests', false, `could not capture (add ${!!addReq}, remove ${!!removeReq}, bId ${bId})`)
await B.ctx.close()

// keyboard only
await page.goto(ORIGIN + '/portal/courses')
await page.getByLabel('Course code').focus()
await page.keyboard.type('KEY 1')
await page.keyboard.press('Tab'); await page.keyboard.type('Keyboard course')
let reached = false
for (let i = 0; i < 8 && !reached; i++) { await page.keyboard.press('Tab'); reached = await page.evaluate(() => document.activeElement?.textContent?.trim() === 'Add course') }
await page.keyboard.press('Enter')
await msg(page, 'Course added.')
rec('R11 a course can be added by keyboard alone', reached && (await waitCount(page, 3)) === 3, 'keyboard')
await A.ctx.close()

// limit and phone width
{
  const ph = await signedIn(EMAIL3, { width: 390, height: 800 })
  await ph.page.goto(ORIGIN + '/portal/courses')
  sql(`insert into identity.course_taught ("userId","code","title","season","year") select (select id from identity."user" where email = '${EMAIL3}'), 'FILL ' || g, 'Filler course with a fairly long title to test wrapping at phone width ' || g, 'Fall', 2000 + (g % 20) from generate_series(1, 60) g`)
  await ph.page.reload()
  rec('R12 sixty courses list without horizontal scroll at 390 px', (await ph.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0, 'no overflow')
  await fill(ph.page, { code: 'ONE MORE', title: 'Over the limit', season: 'Fall', year: '2026' })
  await ph.page.getByRole('button', { name: 'Add course' }).click()
  await msg(ph.page, 'You have reached the limit of 60 courses.')
  rec('R13 the sixty-first course is refused with the limit message', (await items(ph.page).count()) === 60, 'limit')
  await ph.page.screenshot({ path: `${SHOTS}/courses-phone.png` })
  await ph.ctx.close()
}
fs.writeFileSync(OUT, JSON.stringify(results, null, 2))
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
