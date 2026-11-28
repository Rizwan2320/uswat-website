/**
 * FP-22 (leaver handling): the Registrar marks a Sample person as left, end to end in Chromium on one local server (portal scratch database fp20,
 * CMS scratch database cmsdemo, Sample people, example.invalid). Env: ORIGIN, PASSWORD, PDB, CDB, SLUG, OUT, SHOTS.
 * The signed departure message goes over HTTP to the same local server, exactly as it would go to the real site.
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, PASSWORD, PDB, CDB, SLUG, OUT, SHOTS } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const psql = (db, q) => execFileSync('psql', [db, '-tAc', q]).toString().trim()
fs.mkdirSync(SHOTS, { recursive: true })
const browser = await chromium.launch()
const personName = psql(CDB, `select l.name from people p join people_locales l on l._parent_id=p.id and l._locale='en' where p.slug='${SLUG}'`)

async function signedIn(email, ip, viewport = { width: 1280, height: 1000 }) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { 'x-real-ip': ip }, viewport })
  const p = await ctx.newPage()
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('WebAuthn.enable')
  await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } })
  p.setDefaultNavigationTimeout(120000); p.setDefaultTimeout(60000)
  await p.goto(ORIGIN + '/portal/sign-in')
  await p.getByLabel('Email address').fill(email)
  await p.getByLabel('Password').fill(PASSWORD)
  await p.getByRole('button', { name: 'Sign in with password' }).click()
  await p.waitForURL('**/portal/enrol', { timeout: 30000 })
  await p.getByRole('button', { name: 'Add a passkey' }).click()
  await p.getByRole('list', { name: 'Save your recovery codes' }).waitFor({ timeout: 60000 })
  await p.getByLabel('I have saved these codes').check()
  await p.getByRole('button', { name: 'Continue to the portal' }).click()
  await p.waitForURL('**/portal', { timeout: 20000 })
  return { ctx, p }
}

// Warm the routes first: a cold compile in the dev server can exceed the 8 second send limit.
await fetch(ORIGIN + '/api/portal/publish')
const anon = await browser.newContext({ viewport: { width: 1280, height: 1000 } })
const a = await anon.newPage(); a.setDefaultNavigationTimeout(120000)
async function publicPage(name, vp) {
  if (vp) await a.setViewportSize(vp)
  await a.goto(`${ORIGIN}/people/${SLUG}?t=${Date.now()}`); await a.waitForLoadState('networkidle')
  await a.screenshot({ path: `${SHOTS}/${name}`, fullPage: true })
  return a.locator('main').innerText()
}

// 1. Before: a current person with contact details.
const t0 = await publicPage('01-public-before.png')
rec('L1 before: the public page shows the office, hours and email, and no former notice', t0.includes('Block B, room 4') && t0.includes('Mon and Wed') && t0.includes('sample.person02@example.invalid') && !t0.includes('Former faculty'), 'current person with contact details')

// 2. The person signs in (so there is a live session to end), and the Registrar signs in.
const head = await signedIn('fp22.head@example.invalid', '203.0.113.131')
rec('L2 the person is signed in to the portal', (await head.p.getByRole('heading', { level: 1 }).first().innerText()).length > 0, head.p.url())
const reg = await signedIn('fp22.reg@example.invalid', '203.0.113.132')
const sessionsBefore = Number(psql(PDB, `select count(*) from identity."session" s join identity."user" u on u.id=s."userId" where u.email='fp22.head@example.invalid'`))
rec('L3 the person has a live session before the departure', sessionsBefore >= 1, `sessions: ${sessionsBefore}`)

// 3. The Registrar opens the person and sees the leave card; saving with nothing filled in names what is missing.
const r = reg.p
await r.goto(ORIGIN + '/portal/registrar')
await r.getByLabel('Find a person by name or email').fill('fp22.head')
await r.getByRole('button', { name: 'Search' }).click()
await r.getByRole('link', { name: 'Open' }).first().click()
await r.getByTestId('leave-form').waitFor()
await r.screenshot({ path: `${SHOTS}/02-registrar-leave-form.png`, fullPage: true })
await r.getByTestId('leave-submit').click()
await r.getByTestId('leave-outcome-error').waitFor()
rec('L4 an empty form is refused and names the outcome, the source and the confirmation', (await r.getByTestId('leave-outcome-error').count()) === 1 && (await r.getByTestId('leave-source-error').count()) === 1 && (await r.getByTestId('leave-confirm-error').count()) === 1, 'three field errors shown')
rec('L5 nothing changed after the refused attempt', psql(PDB, `select coalesce((select status from identity.account_status s join identity."user" u on u.id=s."userId" where u.email='fp22.head@example.invalid'),'none')`) === 'active' && psql(PDB, `select count(*) from identity.account_departure`) === '0', 'status still active, no log row')

// 4. Mark as left.
await r.getByTestId('leave-outcome-former').check()
await r.getByTestId('leave-source').fill('Resignation accepted, order 12 of 20 Nov 2026 (Sample)')
await r.getByTestId('leave-confirm').check()
await r.getByTestId('leave-submit').click()
await r.getByTestId('left-card').waitFor({ timeout: 30000 })
const summary = await r.getByTestId('left-summary').innerText()
rec('L6 the Registrar sees "Marked as left" with the outcome and the source', summary.includes('Former faculty') && summary.includes('order 12'), summary.replace(/\s+/g, ' '))
const st = psql(PDB, `select s.status from identity.account_status s join identity."user" u on u.id=s."userId" where u.email='fp22.head@example.invalid'`)
const dep = psql(PDB, `select outcome || '|' || "rolesRemoved"::text from identity.account_departure`)
const sess = psql(PDB, `select count(*) from identity."session" s join identity."user" u on u.id=s."userId" where u.email='fp22.head@example.invalid'`)
const headRole = psql(PDB, `select count(*) from identity.head_role h join identity."user" u on u.id=h."userId" where u.email='fp22.head@example.invalid'`)
rec('L7 the account ended: status left, no sessions, head role removed, one log row', st === 'left' && sess === '0' && headRole === '0' && dep === 'former|{head}', `status=${st} sessions=${sess} headRole=${headRole} log=${dep}`)

// 5. The public page changes without anyone pressing a button.
let t1 = ''
for (let i = 0; i < 40; i++) { t1 = await publicPage('03-public-after.png'); if (t1.includes('Former faculty')) break; await a.waitForTimeout(1500) }
rec('L8 the public page now says Former faculty, at the same address', t1.includes('Former faculty') && t1.includes(personName), 'notice present, name still shown')
rec('L9 no email, office, location or hours on the public page', !t1.includes('sample.person02@example.invalid') && !t1.includes('Block B, room 4') && !t1.includes('Mon and Wed'), 'all four gone')
const dbRow = psql(CDB, `select faculty_status || '|' || coalesce(email,'null') || '|' || coalesce(office_location,'null') || '|' || coalesce(office_hours,'null') from people where slug='${SLUG}'`)
rec('L10 the CMS record holds former and no contact details', dbRow === 'former|null|null|null', dbRow)
await publicPage('04-public-after-phone.png', { width: 390, height: 844 })
const overflow = await a.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
rec('L11 phone width: no sideways scroll', !overflow, 'scrollWidth <= clientWidth at 390 px')

// 6. The directory no longer lists them.
await a.setViewportSize({ width: 1280, height: 1000 })
let listed = true
for (let i = 0; i < 20 && listed; i++) { await a.goto(`${ORIGIN}/people?t=${Date.now()}`); await a.waitForLoadState('networkidle'); listed = (await a.locator('main').innerText()).includes(personName); if (listed) await a.waitForTimeout(1500) }
rec('L12 the people directory no longer lists them', !listed, 'name absent from /people')

// 7. The person is out, and cannot come back.
await head.p.goto(ORIGIN + '/portal')
await head.p.waitForLoadState('networkidle')
rec('L13 the person’s open portal session has ended', head.p.url().includes('/portal/sign-in'), head.p.url())
const fresh = await browser.newContext({ extraHTTPHeaders: { 'x-real-ip': '203.0.113.133' } })
const f = await fresh.newPage(); f.setDefaultNavigationTimeout(120000)
await f.goto(ORIGIN + '/portal/sign-in')
await f.getByLabel('Email address').fill('fp22.head@example.invalid')
await f.getByLabel('Password').fill(PASSWORD)
await f.getByRole('button', { name: 'Sign in with password' }).click()
await f.waitForTimeout(4000)
await f.goto(ORIGIN + '/portal')
await f.waitForLoadState('networkidle')
rec('L14 signing in again does not get them into the portal', f.url().includes('/portal/sign-in'), f.url())

// 8. The Registrar's screen: public page status, no second leave form.
await r.goto(ORIGIN + '/portal/registrar')
await r.getByLabel('Find a person by name or email').fill('fp22.head')
await r.getByRole('button', { name: 'Search' }).click()
await r.getByRole('link', { name: 'Open' }).first().click()
await r.getByTestId('left-card').waitFor()
const ok = await r.getByTestId('left-public-ok').count()
rec('L15 the Registrar sees the public page was updated, and there is no second leave form', ok === 1 && (await r.getByTestId('leave-form').count()) === 0 && (await r.getByTestId('registrar-form').count()) === 0, 'left-public-ok shown; forms gone')
await r.screenshot({ path: `${SHOTS}/05-registrar-after.png`, fullPage: true })

fs.writeFileSync(OUT, JSON.stringify(results, null, 2))
console.log(`${results.filter((x) => x.ok).length} of ${results.length} passed`)
await browser.close()
