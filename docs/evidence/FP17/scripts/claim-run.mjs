/**
 * FP-17 (FP-01, PJ1, section 5.6): claim by invitation and activation by the department head, driven in Chromium against the running
 * production build. The invitation is made with the real operator command; the claim, enrolment, waiting page, activation and
 * decline are all done through the screens. Sample people only (example.invalid).
 * Env: ORIGIN, PASSWORD (heads), DBURL, OUT, SHOTS, APPWEB.
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, PASSWORD, DBURL, OUT, SHOTS, APPWEB } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const sql = (q) => execFileSync('psql', [DBURL, '-tAc', q]).toString().trim()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch()
const cli = (script, ...args) => {
  try {
    const out = execFileSync('npx', ['tsx', `scripts/${script}.ts`, ...args], { cwd: APPWEB, env: { ...process.env, PORTAL_DATABASE_URL: DBURL, PORTAL_ORIGIN: ORIGIN }, stdio: ['ignore', 'pipe', 'pipe'] }).toString()
    return { code: 0, out }
  } catch (e) { return { code: e.status, out: String(e.stdout) + String(e.stderr) } }
}
const CS = 'Computer Science (sample)', PHY = 'Physics (sample)'
const MYPW = 'my own long sample password'

async function device(ip, extra = {}) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { 'x-real-ip': ip }, ...extra })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  const r = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } })
  return { ctx, page, cdp, authId: r.authenticatorId }
}
async function signInPassword(page, email, password) {
  await page.goto(ORIGIN + '/portal/sign-in')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in with password' }).click()
}
async function addPasskey(page, landing) {
  await page.waitForURL('**/portal/enrol', { timeout: 15000 })
  await page.getByRole('button', { name: 'Add a passkey' }).click()
  await page.getByText('Your passkey is saved.').waitFor({ timeout: 15000 })
  await page.getByRole('button', { name: 'Get my recovery codes' }).click()
  await page.getByRole('list', { name: 'Save your recovery codes' }).waitFor()
  await page.getByLabel('I have saved these codes').check()
  await page.getByRole('button', { name: 'Continue to the portal' }).click()
  await page.waitForURL(landing, { timeout: 15000 })
}
async function headDevice(email, ip, dept) {
  const r = [cli('identity-roles', 'set-department', email, dept), cli('identity-roles', 'grant-head', email)]
  if (r.some((x) => x.code !== 0)) throw new Error('role setup failed ' + JSON.stringify(r))
  const d = await device(ip)
  await signInPassword(d.page, email, PASSWORD)
  await addPasskey(d.page, '**/portal')
  return d
}
const invite = (record, email, name, dept) => {
  const r = cli('identity-invite', record, email, name, dept)
  return { ...r, json: r.code === 0 ? JSON.parse(r.out) : null }
}
const UNAVAILABLE = 'The invitation link was already used'

// ---- two heads in two departments
const headCs = await headDevice('head.cs@example.invalid', '203.0.113.21', CS)
await sleep(800)
const headPhy = await headDevice('head.phy@example.invalid', '203.0.113.22', PHY)
const headCsId = sql(`select id from identity."user" where email = 'head.cs@example.invalid'`)

// ---- the operator command
{
  const bad = cli('identity-invite', 'rec_x', 'not-an-email', 'Sample', CS)
  rec('C1 the invite command refuses a bad address and writes nothing', bad.code === 1 && /"field":"email"/.test(bad.out) && Number(sql(`select count(*) from identity.invitation`)) === 0, bad.out.trim().slice(0, 60))
}
const first = invite('rec_001', 'ayesha.sample@example.invalid', 'Dr Ayesha Sample', CS)
const link1 = first.json?.link
rec('C2 the command prints one claim link with a 43-character token and says no email is sent', !!link1 && /\/portal\/claim\/[A-Za-z0-9_-]{43}$/.test(link1) && /no email/.test(first.out), link1 ? link1.replace(/[A-Za-z0-9_-]{43}$/, '<token>') : first.out.slice(0, 80))
{
  const token = link1.split('/').pop()
  const everywhere = sql(`select count(*) from identity.invitation i where i::text like '%${token}%'`)
  rec('C3 only a hash of the token is stored', everywhere === '0' && sql(`select count(*) from identity.invitation where "tokenHash" is not null and char_length("tokenHash") = 64`) === '1', 'token not found in the row')
}
const second = invite('rec_001', 'ayesha.sample@example.invalid', 'Dr Ayesha Sample', CS)
const link = second.json.link
{
  const d = await device('203.0.113.30')
  await d.page.goto(link1)
  const old = await d.page.getByTestId('claim-unavailable').innerText().catch(() => '')
  rec('C4 inviting the same record again closes the first link', old.includes(UNAVAILABLE), 'first link shows the unavailable page')
  await d.ctx.close()
}

// ---- the claimant
const person = await device('203.0.113.31')
const p = person.page
await p.goto(link)
{
  const meta = await p.locator('meta[name=referrer]').getAttribute('content')
  const robots = await p.locator('meta[name=robots]').getAttribute('content')
  rec('C5 the link page is sent no-referrer and noindex', meta === 'no-referrer' && /noindex/.test(robots ?? ''), `${meta}, ${robots}`)
  const intro = await p.getByTestId('claim-intro').innerText()
  rec('C6 the page names the person and the address the link was sent to, nothing else', intro.includes('Dr Ayesha Sample') && intro.includes('ayesha.sample@example.invalid'), intro.slice(0, 80))
  await p.screenshot({ path: `${SHOTS}/claim-desktop.png`, fullPage: true })
  await p.getByLabel('Choose a password').fill('short')
  await p.getByLabel('Type it again').fill('short')
  await p.getByTestId('claim-submit').click()
  const e1 = await p.getByTestId('claim-error').innerText()
  await p.getByLabel('Choose a password').fill(MYPW)
  await p.getByLabel('Type it again').fill(MYPW + 'x')
  await p.getByTestId('claim-submit').click()
  const e2 = await p.getByTestId('claim-error').innerText()
  rec('C7 a short password and two different passwords are refused beside the form, and nothing is created', /15 characters/.test(e1) && /not the same/.test(e2) && sql(`select count(*) from identity."user" where email = 'ayesha.sample@example.invalid'`) === '0', `${e1} / ${e2}`)
  await p.getByLabel('Type it again').fill(MYPW)
  await p.getByTestId('claim-submit').click()
  await p.waitForURL('**/portal/sign-in?reason=claimed', { timeout: 20000 })
  rec('C8 a good password creates the account and sends the person to sign in, with a notice that says what comes next', (await p.getByRole('status').innerText()).includes('department head must also confirm'), 'notice shown')
  rec('C9 the account is pending, in the invited department, with the claim recorded', sql(`select s.status || '|' || d.department || '|' || coalesce(s."recordRef",'') from identity.account_status s join identity.account_department d using ("userId") join identity."user" u on u.id = s."userId" where u.email = 'ayesha.sample@example.invalid'`) === `pending-activation|${CS}|rec_001`, 'pending-activation')
}

// ---- the same link again, a made-up link, a malformed one: one answer
{
  const d = await device('203.0.113.32')
  const texts = []
  for (const l of [link, `${ORIGIN}/portal/claim/${'B'.repeat(43)}`, `${ORIGIN}/portal/claim/short`, `${ORIGIN}/portal/claim/${'A'.repeat(43)}`]) {
    await d.page.goto(l)
    texts.push(await d.page.locator('main').innerText())
  }
  rec('C10 a used link, a made-up link and a malformed link all show the same page', new Set(texts).size === 1 && texts[0].includes(UNAVAILABLE) && !texts[0].includes('Ayesha'), 'identical text, no name')
  await d.ctx.close()
}

// ---- enrol, then wait
await signInPassword(p, 'ayesha.sample@example.invalid', MYPW)
await addPasskey(p, '**/portal/pending')
{
  rec('C11 after signing in and adding a passkey the person lands on the waiting page', (await p.getByTestId('pending-body').innerText()).includes('department head must confirm'), p.url().replace(ORIGIN, ''))
  const nav = await p.getByRole('navigation', { name: 'Portal' }).innerText()
  rec('C12 the waiting page offers only Sign out', nav.trim() === 'Sign out', JSON.stringify(nav.trim()))
  const where = []
  for (const path of ['/portal', '/portal/profile', '/portal/review', '/portal/security', '/portal/cv', '/portal/activate']) { await p.goto(ORIGIN + path); where.push(new URL(p.url()).pathname) }
  rec('C13 every other portal page sends a pending person back to the waiting page', where.every((w) => w === '/portal/pending'), where.join(' '))
  const status = await p.evaluate(async () => (await fetch('/portal-api/auth/passkey/list-user-passkeys')).status)
  const sess = await p.evaluate(async () => (await fetch('/portal-api/auth/get-session')).status)
  rec('C14 the API refuses a pending person too, except reading the session', status === 403 && sess === 200, `list ${status}, session ${sess}`)
  await p.screenshot({ path: `${SHOTS}/pending-desktop.png`, fullPage: true })
}

// ---- the heads
{
  await headPhy.page.goto(ORIGIN + '/portal/activate')
  rec('C15 a head of another department sees nobody waiting', (await headPhy.page.getByTestId('activate-empty').count()) === 1, 'empty list')
  await headCs.page.goto(ORIGIN + '/portal')
  rec('C16 the head sees the link on the home page', (await headCs.page.getByRole('link', { name: /Confirm new faculty accounts/ }).count()) === 1, 'link shown')
  await headCs.page.goto(ORIGIN + '/portal/activate')
  const row = await headCs.page.locator('[data-testid=pending-list] li').first().innerText()
  rec('C17 the head sees the pending person with the invited address', row.includes('Dr Ayesha Sample') && row.includes('ayesha.sample@example.invalid'), row.split('\n').slice(0, 2).join(' / '))
  await headCs.page.screenshot({ path: `${SHOTS}/activate-desktop.png`, fullPage: true })
  // stale second factor
  const sid = sql(`select s.id from identity.session s where s."userId"='${headCsId}' order by s."createdAt" desc limit 1`)
  sql(`update identity.session_assurance set "verifiedAt" = now() - interval '30 minutes' where "sessionId"='${sid}'`)
  await headCs.page.goto(ORIGIN + '/portal/activate')
  rec('C18 with an old confirmation the buttons are off and the page says why', (await headCs.page.getByTestId('needs-fresh').count()) === 1 && (await headCs.page.getByTestId('activate').isDisabled()), 'disabled with notice')
  sql(`update identity.session_assurance set "verifiedAt" = now() where "sessionId"='${sid}'`)
  await headCs.page.goto(ORIGIN + '/portal/activate')
  await headCs.page.getByTestId('activate').focus()
  await headCs.page.keyboard.press('Enter')
  await headCs.page.waitForURL('**/portal/activate?decided=activated', { timeout: 15000 })
  rec('C19 Confirm works from the keyboard, the notice says so and the list is empty', (await headCs.page.getByTestId('activate-notice').innerText()).includes('Confirmed') && (await headCs.page.getByTestId('activate-empty').count()) === 1, 'confirmed')
  rec('C20 the person is active, with who confirmed them and when, and the decision is logged', sql(`select s.status || '|' || (s."activatedBy" = '${headCsId}')::text || '|' || (s."activatedAt" is not null)::text from identity.account_status s join identity."user" u on u.id = s."userId" where u.email = 'ayesha.sample@example.invalid'`) === 'active|true|true' && sql(`select count(*) from identity.account_review where decision='activated' and "reviewerId"='${headCsId}'`) === '1', 'active')
}
{
  await p.goto(ORIGIN + '/portal/pending')
  const at1 = new URL(p.url()).pathname
  await p.goto(ORIGIN + '/portal/profile')
  rec('C21 the person is let in with the same session: the waiting page sends them home and the profile opens', at1 === '/portal' && (await p.getByRole('heading', { name: 'Your profile' }).count()) === 1, `${at1} then profile`)
}

// ---- a second person, declined
const inv2 = invite('rec_002', 'omar.sample@example.invalid', 'Mr Omar Sample', CS)
const person2 = await device('203.0.113.33')
{
  const q = person2.page
  await q.goto(inv2.json.link)
  await q.getByLabel('Choose a password').fill(MYPW)
  await q.getByLabel('Type it again').fill(MYPW)
  await q.getByTestId('claim-submit').click()
  await q.waitForURL('**/portal/sign-in?reason=claimed', { timeout: 20000 })
  await signInPassword(q, 'omar.sample@example.invalid', MYPW)
  await addPasskey(q, '**/portal/pending')
  await headCs.page.goto(ORIGIN + '/portal/activate')
  headCs.page.once('dialog', (dlg) => dlg.accept())
  await headCs.page.getByTestId('decline').click()
  await headCs.page.waitForURL('**/portal/activate?decided=declined', { timeout: 15000 })
  rec('C22 declining closes the account and ends its sessions', sql(`select s.status from identity.account_status s join identity."user" u on u.id = s."userId" where u.email = 'omar.sample@example.invalid'`) === 'suspended' && sql(`select count(*) from identity.session s join identity."user" u on u.id = s."userId" where u.email = 'omar.sample@example.invalid'`) === '0', 'suspended, no sessions')
  await q.goto(ORIGIN + '/portal/pending')
  rec('C23 the declined person is signed out on the next click', new URL(q.url()).pathname === '/portal/sign-in', new URL(q.url()).pathname)
  await signInPassword(q, 'omar.sample@example.invalid', MYPW)
  await sleep(2500)
  await q.goto(ORIGIN + '/portal')
  await sleep(500)
  rec('C24 signing in again gets them nowhere: no portal page, and no redirect loop', new URL(q.url()).pathname === '/portal/sign-in', new URL(q.url()).pathname)
}

// ---- expiry, and a signed-in visitor
{
  const inv3 = invite('rec_003', 'sara.sample@example.invalid', 'Ms Sara Sample', CS)
  sql(`update identity.invitation set "createdAt" = now() - interval '80 hours', "expiresAt" = now() - interval '8 hours' where "recordRef" = 'rec_003'`)
  const d = await device('203.0.113.34')
  await d.page.goto(inv3.json.link)
  rec('C25 an invitation older than 72 hours shows the same unavailable page and creates nothing', (await d.page.getByTestId('claim-unavailable').count()) === 1 && sql(`select count(*) from identity."user" where email = 'sara.sample@example.invalid'`) === '0', 'expired')
  await d.ctx.close()
  const inv4 = invite('rec_004', 'tariq.sample@example.invalid', 'Mr Tariq Sample', CS)
  await headCs.page.goto(inv4.json.link)
  rec('C26 someone already signed in who opens a link is sent home, not shown it', new URL(headCs.page.url()).pathname === '/portal', new URL(headCs.page.url()).pathname)
}

// ---- narrow screen
{
  const inv5 = invite('rec_005', 'zara.sample@example.invalid', 'Ms Zara Sample', CS)
  const d = await device('203.0.113.35', { viewport: { width: 390, height: 844 } })
  await d.page.goto(inv5.json.link)
  const w1 = await d.page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
  await d.page.screenshot({ path: `${SHOTS}/claim-390.png`, fullPage: true })
  await d.ctx.close()
  // A real row, so the table is checked at 390 px with content and not only the empty message.
  const inv6 = invite('rec_006', 'a.very.long.sample.address.for.layout@example.invalid', 'Professor Abdul Rahman Muhammad Sample-Khan (sample)', CS)
  const d6 = await device('203.0.113.36')
  await d6.page.goto(inv6.json.link)
  await d6.page.getByLabel('Choose a password').fill(MYPW)
  await d6.page.getByLabel('Type it again').fill(MYPW)
  await d6.page.getByTestId('claim-submit').click()
  await d6.page.waitForURL('**/portal/sign-in?reason=claimed', { timeout: 20000 })
  await signInPassword(d6.page, 'a.very.long.sample.address.for.layout@example.invalid', MYPW)
  await addPasskey(d6.page, '**/portal/pending')
  await headCs.page.setViewportSize({ width: 390, height: 844 })
  await headCs.page.goto(ORIGIN + '/portal/activate')
  await headCs.page.locator('[data-testid=pending-list]').waitFor()
  const w2 = await headCs.page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
  await headCs.page.screenshot({ path: `${SHOTS}/activate-390.png`, fullPage: true })
  await p.setViewportSize({ width: 390, height: 844 })
  const btn = await headCs.page.getByTestId('activate').boundingBox()
  rec('C27 at 390 px the claim page and the activation page (with a long name and address in the row) do not scroll sideways and the buttons stay on screen', w1[0] <= w1[1] && w2[0] <= w2[1] && btn.x >= 0 && btn.x + btn.width <= 390, `claim ${w1}, activate ${w2}, button ${Math.round(btn.x)}..${Math.round(btn.x + btn.width)}`)
}

// ---- the left status from the operator command
{
  const r = cli('identity-roles', 'set-status', 'ayesha.sample@example.invalid', 'left')
  await p.setViewportSize({ width: 1280, height: 800 })
  await p.goto(ORIGIN + '/portal/profile')
  rec('C28 marking someone as left ends their session the same moment', r.code === 0 && new URL(p.url()).pathname === '/portal/sign-in', `${r.out.trim()} -> ${new URL(p.url()).pathname}`)
}

fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), results }, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
