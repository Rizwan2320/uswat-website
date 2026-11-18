/**
 * FP-8: step-up and session rotation in Chromium (virtual authenticator) against the running app.
 * Env: ORIGIN, DB (psql URL of the portal database), EMAIL_PK, EMAIL_TOTP, PASSWORD, OUT.
 * "Ageing" the proof is done in the database (verifiedAt moved back 11 minutes): the 10-minute wait itself is not run.
 */
import { createRequire } from 'node:module'
import { createHmac } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, DB, EMAIL_PK, EMAIL_TOTP, PASSWORD, OUT } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sql = (q) => execFileSync('psql', [DB, '-Atc', q], { encoding: 'utf8' }).trim()
const sessionsOf = (email) => sql(`select s.id from identity.session s join identity."user" u on u.id=s."userId" where u.email='${email}' order by s."createdAt"`).split('\n').filter(Boolean)
const age = (email) => sql(`update identity.session_assurance set "verifiedAt" = now() - interval '11 minutes' where "sessionId" in (select s.id from identity.session s join identity."user" u on u.id=s."userId" where u.email='${email}')`)
// The seed script's sign-up leaves a session behind; drop it so the checks count only what the browser makes.
const dropSessions = (email) => sql(`delete from identity.session where "userId" in (select id from identity."user" where email='${email}')`)
const path = (p) => new URL(p.url()).pathname
const browser = await chromium.launch()
const authOpts = { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true }
function b32(s) { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let b = ''; for (const c of s.replace(/[\s=]/g, '').toUpperCase()) b += A.indexOf(c).toString(2).padStart(5, '0'); const o = []; for (let i = 0; i + 8 <= b.length; i += 8) o.push(parseInt(b.slice(i, i + 8), 2)); return Buffer.from(o) }
function totp(secret, off = 0) { const c = Math.floor(Date.now() / 30000) + off; const buf = Buffer.alloc(8); buf.writeBigUInt64BE(BigInt(c)); const h = createHmac('sha1', b32(secret)).update(buf).digest(); const o = h[19] & 15; return String((h.readUInt32BE(o) & 0x7fffffff) % 1000000).padStart(6, '0') }
const api = (page, method, p, body) => page.evaluate(async ({ method, p, body }) => {
  const r = await fetch('/portal-api/auth' + p, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
  let j = null; try { j = await r.json() } catch {}
  return { status: r.status, body: j }
}, { method, p, body })

// ---- A: passkey account ----
{
  const ctx = await browser.newContext(); const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page)
  await cdp.send('WebAuthn.enable'); await cdp.send('WebAuthn.addVirtualAuthenticator', { options: authOpts })
  dropSessions(EMAIL_PK)
  await page.goto(ORIGIN + '/portal/sign-in')
  await page.getByLabel('Email address').fill(EMAIL_PK); await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in with password' }).click()
  await page.waitForURL('**/portal/enrol')
  await page.getByRole('button', { name: 'Add a passkey' }).click()
  await page.getByText('Your passkey is saved.').waitFor()
  rec('A1 first-factor enrolment is not asked to confirm, and leaves one session', sessionsOf(EMAIL_PK).length === 1, `${sessionsOf(EMAIL_PK).length} session(s)`)
  await page.goto(ORIGIN + '/portal/security')
  await page.getByRole('heading', { level: 1, name: 'Sign-in security' }).waitFor()
  await page.getByRole('button', { name: 'Add another passkey' }).waitFor()
  rec('A2 right after signing in the change controls show and there is no confirm card', (await page.getByRole('heading', { name: 'Confirm it is you' }).count()) === 0, 'controls shown')
  const oldCookies = (await ctx.cookies()).filter((c) => c.name.includes('session_token'))
  const oldIds = sessionsOf(EMAIL_PK)

  age(EMAIL_PK)
  await page.reload()
  await page.getByRole('heading', { name: 'Confirm it is you' }).waitFor()
  rec('A3 with a stale proof the page asks for confirmation and hides Add and Make new codes', (await page.getByRole('button', { name: 'Add another passkey' }).count()) === 0 && (await page.getByRole('button', { name: 'Make new recovery codes' }).count()) === 0, 'hidden')
  const direct = await api(page, 'POST', '/recovery/issue', {})
  const del = await api(page, 'POST', '/passkey/delete-passkey', { id: 'whatever' })
  rec('A4 the same changes called directly are refused with 403 step-up required', direct.status === 403 && del.status === 403 && direct.body?.error === 'step-up required', `issue ${direct.status}, delete ${del.status}`)
  rec('A5 read-only calls still work while stale', (await api(page, 'GET', '/list-sessions')).status === 200, 'list-sessions 200')

  await sleep(11000)
  await page.getByRole('button', { name: 'Confirm with my passkey' }).click()
  await page.getByRole('button', { name: 'Add another passkey' }).waitFor({ timeout: 20000 })
  rec('A6 confirming with the passkey brings the controls back', (await page.getByRole('heading', { name: 'Confirm it is you' }).count()) === 0, 'controls shown')
  const newIds = sessionsOf(EMAIL_PK)
  rec('A7 the passkey confirmation made a new session id and ended the old one (SES-03)', newIds.length === 1 && !oldIds.includes(newIds[0]), `old ${oldIds[0].slice(0, 6)}… new ${newIds[0].slice(0, 6)}…`)
  const stale = await browser.newContext(); await stale.addCookies(oldCookies)
  const staleRes = await stale.request.get(ORIGIN + '/portal-api/auth/get-session')
  rec('A8 the old cookie no longer works', staleRes.status() === 401, `status ${staleRes.status()}`)
  await stale.close()
  rec('A9 a change goes through straight after confirming', (await api(page, 'POST', '/recovery/issue', {})).status === 200, 'issue 200')

  // The proof runs out while the page is open
  await page.goto(ORIGIN + '/portal/security')
  await page.getByRole('button', { name: 'Make new recovery codes' }).waitFor()
  age(EMAIL_PK)
  await page.getByRole('button', { name: 'Make new recovery codes' }).click()
  await page.locator('.portal-error').waitFor({ timeout: 10000 })
  rec('A10 if the proof runs out while the page is open the person is told to confirm, in words', /Confirm it is you first/.test(await page.locator('.portal-error').innerText()), await page.locator('.portal-error').innerText())
  await page.getByRole('heading', { name: 'Confirm it is you' }).waitFor({ timeout: 10000 })
  rec('A11 and the page reloads into the confirm card', true, path(page))
  await ctx.close()
}

// ---- B: authenticator-app account, confirm in place ----
{
  const ctx = await browser.newContext(); const page = await ctx.newPage()
  dropSessions(EMAIL_TOTP)
  await page.goto(ORIGIN + '/portal/sign-in')
  await page.getByLabel('Email address').fill(EMAIL_TOTP); await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in with password' }).click()
  await page.waitForURL('**/portal/enrol')
  await page.getByLabel('Your password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Show the setup key' }).click()
  const keyEl = page.getByText(/^[A-Z2-7 ]{16,}$/).first(); await keyEl.waitFor()
  const secret = (await keyEl.innerText()).replace(/\s/g, '')
  await page.getByLabel('Six-digit code from the app').fill(totp(secret, -1))
  await page.getByRole('button', { name: 'Confirm the app' }).click()
  await page.getByText('Your authenticator app is confirmed.').waitFor()
  await page.goto(ORIGIN + '/portal/security')
  await page.getByRole('button', { name: 'Make new recovery codes' }).waitFor()
  const before = sessionsOf(EMAIL_TOTP)
  age(EMAIL_TOTP)
  await page.reload()
  await page.getByRole('heading', { name: 'Confirm it is you' }).waitFor()
  rec('B1 an account with only the app shows the code field and no passkey button', (await page.getByLabel('Six-digit code from the authenticator app').count()) === 1 && (await page.getByRole('button', { name: 'Confirm with my passkey' }).count()) === 0, 'code field only')
  await page.getByLabel('Six-digit code from the authenticator app').fill('000000')
  await page.getByRole('button', { name: 'Confirm with the code' }).click()
  await page.locator('.portal-error').first().waitFor({ timeout: 10000 })
  rec('B2 a wrong code does not confirm', (await page.getByRole('button', { name: 'Make new recovery codes' }).count()) === 0, await page.locator('.portal-error').first().innerText())
  await page.getByLabel('Six-digit code from the authenticator app').fill(totp(secret, 0))
  await page.getByRole('button', { name: 'Confirm with the code' }).click()
  await page.getByRole('button', { name: 'Make new recovery codes' }).waitFor({ timeout: 20000 })
  rec('B3 the right code confirms in place: controls back, same session id', JSON.stringify(sessionsOf(EMAIL_TOTP)) === JSON.stringify(before), 'same session')
  await ctx.close()
}

fs.writeFileSync(OUT, JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
