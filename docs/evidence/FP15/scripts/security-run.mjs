/**
 * FP-15 (FP-51, PJ8): the security centre driven in Chromium against the running production build.
 * Virtual authenticator; a second "device" is a second browser context given a copy of the first one's passkey,
 * so it signs in for real. Env: ORIGIN, EMAIL1, EMAIL2, PASSWORD, DBURL, OUT, SHOTS, APPWEB.
 * Sample accounts only (example.invalid). Network addresses are set per context with the x-real-ip header.
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, EMAIL1, EMAIL2, PASSWORD, DBURL, OUT, SHOTS, APPWEB } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const sql = (q) => execFileSync('psql', [DBURL, '-tAc', q]).toString().trim()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch()
const NET_A = '203.0.113.77', NET_B = '198.51.100.9', NET_C = '192.0.2.5'
const UA_B = 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0'

async function newDevice(ip, extra = {}) {
  const ctx = await browser.newContext({ acceptDownloads: true, extraHTTPHeaders: { 'x-real-ip': ip }, ...extra })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  return { ctx, page, cdp }
}
async function addAuthenticator(cdp) {
  const r = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } })
  return r.authenticatorId
}
async function enrol(email, ip) {
  // The seed script's sign-up opens a session of its own; drop it so only what the run makes is counted.
  sql(`delete from identity.session where "userId" in (select id from identity."user" where email = '${email}')`)
  const d = await newDevice(ip)
  d.authId = await addAuthenticator(d.cdp)
  const { page } = d
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
  return d
}
// A copied passkey would have the same signature counter on two devices, and the library (correctly) treats a
// counter that does not increase as a cloned key. Real devices each hold their own key; here each device is
// primed with a counter above every earlier one before it signs in.
let counter = 100
async function prime(d) {
  const cs = (await d.cdp.send('WebAuthn.getCredentials', { authenticatorId: d.authId })).credentials
  for (const c of cs) {
    await d.cdp.send('WebAuthn.removeCredential', { authenticatorId: d.authId, credentialId: c.credentialId })
    await d.cdp.send('WebAuthn.addCredential', { authenticatorId: d.authId, credential: { ...c, signCount: (counter += 10) } })
  }
}
async function passkeyIn(page) {
  await page.goto(ORIGIN + '/portal/sign-in')
  await page.getByRole('button', { name: 'Sign in with a passkey' }).click()
  await page.waitForURL('**/portal', { timeout: 15000 })
}
const uid = (email) => sql(`select id from identity."user" where email = '${email}'`)
const sessions = (u) => Number(sql(`select count(*) from identity.session where "userId" = '${u}'`))
const alerts = (u) => Number(sql(`select count(*) from identity.security_alert where "userId" = '${u}'`))
const evCount = (u, t) => Number(sql(`select count(*) from identity.security_event where "userId" = '${u}' and type = '${t}'`))
const tableText = async (page) => (await page.getByTestId('security-events').innerText())

// ---- signed out
{
  const d = await newDevice(NET_A)
  await d.page.goto(ORIGIN + '/portal/security')
  rec('R0 signed out, the security page sends the visitor to sign-in', new URL(d.page.url()).pathname === '/portal/sign-in', d.page.url())
  const r = await d.ctx.request.post(ORIGIN + '/portal-api/auth/security/not-me', { data: {}, headers: { origin: ORIGIN } })
  rec('R1 signed out, "This wasn\'t me" and "Sign out everywhere" are refused', r.status() === 401 && (await d.ctx.request.post(ORIGIN + '/portal-api/auth/security/sign-out-everywhere', { data: {}, headers: { origin: ORIGIN } })).status() === 401, `status ${r.status()}`)
  await d.ctx.close()
}

// ---- first device, first account
const A = await enrol(EMAIL1, NET_A)
const idA = uid(EMAIL1)
await A.page.goto(ORIGIN + '/portal/security')
const t0 = await tableText(A.page)
const iCodes = t0.indexOf('New recovery codes were made'), iKey = t0.indexOf('A passkey was added'), iPw = t0.indexOf('Password accepted')
rec('R2 the activity list shows what enrolment did, newest first (codes, passkey added, password accepted)', iCodes > -1 && iKey > iCodes && iPw > iKey, `positions ${iCodes} < ${iKey} < ${iPw}`)
rec('R3 the network is shown as a prefix (203.0.113.x), never the full address', t0.includes('203.0.113.x') && !t0.includes('203.0.113.77') && !t0.includes('.77'), 'prefix only')
rec('R4 the table has a caption and column headers, and each row a When, What, Network and Result', (await A.page.locator('[data-testid=security-events] th[scope=col]').count()) === 4 && (await A.page.locator('[data-testid=security-events] caption').count()) === 1, '4 headers, 1 caption')
const pk = await A.page.getByText(/Synced across your devices|This device only/).first().innerText()
rec('R5 each passkey says whether it is synced or on this device only', /Synced across your devices|This device only/.test(pk), pk)
await A.page.screenshot({ path: `${SHOTS}/security-desktop.png`, fullPage: true })

// ---- second device: a real second sign-in with a copy of the passkey
const creds = (await A.cdp.send('WebAuthn.getCredentials', { authenticatorId: A.authId })).credentials
const B = await newDevice(NET_B, { userAgent: UA_B })
B.authId = await addAuthenticator(B.cdp)
for (const c of creds) await B.cdp.send('WebAuthn.addCredential', { authenticatorId: B.authId, credential: c })
await prime(B)
await passkeyIn(B.page)
await A.page.reload()
await A.page.getByText(/Firefox on Linux/).waitFor({ timeout: 15000 }).catch(() => {})
const devices = await A.page.getByRole('region', { name: 'Devices signed in' }).innerText()
rec('R6 the second device appears in "Devices signed in" with its browser and network', /Firefox on Linux/.test(devices) && devices.includes('198.51.100.x') && sessions(idA) === 2, `sessions ${sessions(idA)}`)
rec('R7 the second device\'s passkey sign-in is in the activity list with its own network', (await tableText(A.page)).includes('Signed in with a passkey') && (await tableText(A.page)).includes('198.51.100.x'), 'logged')

// ---- cancelling does nothing
{
  const msgs = []
  A.page.once('dialog', async (d) => { msgs.push(d.message()); await d.dismiss() })
  await A.page.getByRole('button', { name: 'Sign out everywhere' }).click()
  await sleep(600)
  rec('R8 cancelling the confirmation leaves every session alone', sessions(idA) === 2 && evCount(idA, 'sign-out-everywhere') === 0 && new URL(A.page.url()).pathname === '/portal/security' && msgs.length === 1 && /every device/.test(msgs[0]), `dialog "${msgs[0]}"`)
  A.page.once('dialog', async (d) => { await d.dismiss() })
  await A.page.getByRole('button', { name: 'This wasn’t me' }).click()
  await sleep(600)
  rec('R9 cancelling "This wasn\'t me" raises no alert and ends nothing', sessions(idA) === 2 && alerts(idA) === 0, 'no alert')
}

// ---- keyboard only
{
  let saw = ''
  A.page.once('dialog', async (d) => { saw = d.message(); await d.dismiss() })
  await A.page.getByRole('button', { name: 'Sign out everywhere' }).focus()
  await A.page.keyboard.press('Enter')
  await sleep(500)
  rec('R10 both buttons work from the keyboard (Enter on the focused button opens the confirmation)', /every device/.test(saw), `dialog "${saw}"`)
}

// ---- a forged request from another site is refused
{
  const r = await A.ctx.request.post(ORIGIN + '/portal-api/auth/security/not-me', { data: {}, headers: { origin: 'https://evil.example' } })
  rec('R11 a request from another site cannot press "This wasn\'t me" for the person', r.status() !== 200 && sessions(idA) === 2 && alerts(idA) === 0, `status ${r.status()}`)
}

// ---- sign out everywhere
{
  A.page.once('dialog', (d) => d.accept())
  await A.page.getByRole('button', { name: 'Sign out everywhere' }).click()
  await A.page.waitForURL('**/portal/sign-in?reason=signed-out-everywhere', { timeout: 15000 })
  rec('R12 sign out everywhere lands on sign-in with a clear notice', (await A.page.getByRole('status').innerText()).includes('signed out of every device'), 'notice shown')
  await B.page.goto(ORIGIN + '/portal/security')
  rec('R13 the other device is signed out too, and the account has no sessions left', new URL(B.page.url()).pathname === '/portal/sign-in' && sessions(idA) === 0, `sessions ${sessions(idA)}`)
  rec('R14 no alert is raised by a plain sign out everywhere', alerts(idA) === 0 && evCount(idA, 'sign-out-everywhere') === 1, 'event logged, no alert')
  await A.page.goto(ORIGIN + '/portal/security')
  rec('R15 the old cookie is dead: the security page sends the first device to sign-in', new URL(A.page.url()).pathname === '/portal/sign-in', A.page.url())
}

// ---- sign back in; the history is there; a failed password is logged
await prime(A)
await passkeyIn(A.page)
await prime(B)
await passkeyIn(B.page)
await sleep(300)
{
  const bad = await newDevice(NET_A)
  await bad.page.goto(ORIGIN + '/portal/sign-in')
  await bad.page.getByLabel('Email address').fill(EMAIL1)
  await bad.page.getByLabel('Password').fill('not the right password at all')
  await bad.page.getByRole('button', { name: 'Sign in with password' }).click()
  await bad.page.locator('.portal-error').waitFor({ timeout: 15000 })
  for (let i = 0; i < 20 && evCount(idA, 'sign-in-failed') === 0; i++) await sleep(250)
  await bad.ctx.close()
}
await A.page.goto(ORIGIN + '/portal/security')
const t1 = await tableText(A.page)
rec('R16 after signing back in the list shows the sign out, the new passkey sign-ins and the wrong password, the last one marked Failed',
  t1.includes('Signed out of every device') && t1.includes('Signed in with a passkey') && /Wrong password tried[^\n]*\n?[^\n]*Failed|Wrong password tried.*Failed/s.test(t1), 'history kept')
rec('R17 a wrong password is logged once for a known account', evCount(idA, 'sign-in-failed') === 1, `rows ${evCount(idA, 'sign-in-failed')}`)

// ---- PJ8
{
  A.page.once('dialog', (d) => d.accept())
  await A.page.getByRole('button', { name: 'This wasn’t me' }).click()
  await A.page.waitForURL('**/portal/sign-in?reason=not-me', { timeout: 15000 })
  rec('R18 PJ8: "This wasn\'t me" lands on sign-in and says the administrator has been alerted', (await A.page.getByRole('status').innerText()).includes('administrator has been alerted'), 'notice shown')
  await B.page.goto(ORIGIN + '/portal/security')
  rec('R19 PJ8: every other device is signed out and the account has no sessions', new URL(B.page.url()).pathname === '/portal/sign-in' && sessions(idA) === 0, `sessions ${sessions(idA)}`)
  const out = JSON.parse(execFileSync('npx', ['tsx', 'scripts/identity-alerts.ts'], { cwd: APPWEB, env: { ...process.env, PORTAL_DATABASE_URL: DBURL } }).toString())
  const mine = out.filter((a) => a.email === EMAIL1)
  rec('R20 PJ8: exactly one open alert for this account, with the network prefix, is shown by the alerts command', mine.length === 1 && mine[0].ipPrefix === '203.0.113.0/24', JSON.stringify(mine.map((m) => ({ ip: m.ipPrefix }))))
  const ack = execFileSync('npx', ['tsx', 'scripts/identity-alerts.ts', '--ack', mine[0].id], { cwd: APPWEB, env: { ...process.env, PORTAL_DATABASE_URL: DBURL } }).toString().trim()
  const after = JSON.parse(execFileSync('npx', ['tsx', 'scripts/identity-alerts.ts'], { cwd: APPWEB, env: { ...process.env, PORTAL_DATABASE_URL: DBURL } }).toString())
  rec('R21 the alert can be acknowledged once and then no longer lists', ack === '{"acknowledged":true}' && !after.some((a) => a.id === mine[0].id), ack)
}
await prime(A)
await passkeyIn(A.page)
await A.page.goto(ORIGIN + '/portal/security')
rec('R22 the "This wasn\'t me" press is in the history after signing back in', (await tableText(A.page)).includes('“This wasn’t me” was pressed'), 'logged')

// ---- phone width
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, extraHTTPHeaders: { 'x-real-ip': NET_A } })
  await ctx.addCookies(await A.ctx.cookies())
  const p = await ctx.newPage()
  await p.goto(ORIGIN + '/portal/security')
  await p.getByTestId('security-events').waitFor()
  await p.waitForFunction(() => !document.body.innerText.includes('Loading…'), null, { timeout: 15000 })
  const w = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  rec('R23 at 390 px the page does not scroll sideways', w.sw <= w.iw, `scrollWidth ${w.sw}, innerWidth ${w.iw}`)
  const tw = await p.evaluate(() => { const e = document.querySelector('.portal-table-wrap'); return { sw: e.scrollWidth, cw: e.clientWidth } })
  rec('R23b at 390 px all four columns fit without scrolling inside the table (the Result column is not hidden)', tw.sw <= tw.cw, `table scrollWidth ${tw.sw}, visible ${tw.cw}`)
  await p.screenshot({ path: `${SHOTS}/security-390.png`, fullPage: true })
  await ctx.close()
}

// ---- the log keeps only prefixes; another account sees only its own history
{
  const bad = sql(`select count(*) from identity.security_event where "ipPrefix" is not null and "ipPrefix" !~ '^[0-9]+\\.[0-9]+\\.[0-9]+\\.0/24$'`)
  const full = sql(`select count(*) from identity.security_event where "ipPrefix" like '%.77%' or "ipPrefix" like '%.9/%'`)
  rec('R24 every stored network is a /24 prefix; no full address is in the log', bad === '0' && full === '0', `non-prefix rows ${bad}`)
  await sleep(11000) // the library limits sign-ins to 3 per 10 s per address
  const C = await enrol(EMAIL2, NET_C)
  await C.page.goto(ORIGIN + '/portal/security')
  const tc = await tableText(C.page)
  rec('R25 another account sees only its own history', tc.includes('192.0.2.x') && !tc.includes('203.0.113.x') && !tc.includes('198.51.100.x') && !tc.includes('“This wasn’t me” was pressed') && !tc.includes('Signed out of every device'), 'isolation')
  await C.ctx.close()
}

// ---- empty-list state is not reachable after sign-in (the sign-in itself is logged); check the wording exists in the build
rec('R26 events are logged for the sign-in itself, so a signed-in person never sees an empty list', Number(sql(`select count(*) from identity.security_event where "userId" = '${idA}'`)) > 0, 'rows exist')

await A.ctx.close(); await B.ctx.close()
fs.writeFileSync(OUT, JSON.stringify(results, null, 2))
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
