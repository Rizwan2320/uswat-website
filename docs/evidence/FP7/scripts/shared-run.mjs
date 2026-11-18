/**
 * FP-9: the "shared computer" option in Chromium (virtual authenticator) against the running app.
 * Env: ORIGIN, DB, EMAIL_TOTP, EMAIL_PK, PASSWORD, OUT. "Idle for 16 minutes" is made by moving the session's
 * updatedAt back in the database; the 15 minutes themselves are not waited out.
 */
import { createRequire } from 'node:module'
import { createHmac } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, DB, EMAIL_TOTP, EMAIL_PK, PASSWORD, OUT } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sql = (q) => execFileSync('psql', [DB, '-Atc', q], { encoding: 'utf8' }).trim()
const uid = (email) => sql(`select id from identity."user" where email='${email}'`)
const dropSessions = (email) => sql(`delete from identity.session where "userId"='${uid(email)}'`)
const sharedCount = (email) => Number(sql(`select count(*) from identity.session_shared where "sessionId" in (select id from identity.session where "userId"='${uid(email)}')`))
const idle = (email, min) => sql(`update identity.session set "updatedAt" = now() - interval '${min} minutes' where "userId"='${uid(email)}'`)
const path = (p) => new URL(p.url()).pathname + new URL(p.url()).search
const authOpts = { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true }
function b32(s) { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let b = ''; for (const c of s.replace(/[\s=]/g, '').toUpperCase()) b += A.indexOf(c).toString(2).padStart(5, '0'); const o = []; for (let i = 0; i + 8 <= b.length; i += 8) o.push(parseInt(b.slice(i, i + 8), 2)); return Buffer.from(o) }
function totp(secret, off = 0) { const c = Math.floor(Date.now() / 30000) + off; const buf = Buffer.alloc(8); buf.writeBigUInt64BE(BigInt(c)); const h = createHmac('sha1', b32(secret)).update(buf).digest(); const o = h[19] & 15; return String((h.readUInt32BE(o) & 0x7fffffff) % 1000000).padStart(6, '0') }
// Each code can be used once (replay guard) and the server accepts the previous, current and next 30-second step:
// take a step we have not used yet, and wait for the clock if all are used.
let lastUsedStep = Math.floor(Date.now() / 30000) - 1
async function nextCode(secret) {
  for (;;) {
    const now = Math.floor(Date.now() / 30000)
    const step = Math.max(lastUsedStep + 1, now - 1)
    if (step <= now + 1) { lastUsedStep = step; return totp(secret, step - now) }
    await sleep(2000)
  }
}
const browser = await chromium.launch()
const newCtx = async (withAuth) => {
  const ctx = await browser.newContext(); const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  if (withAuth) { await cdp.send('WebAuthn.enable'); await cdp.send('WebAuthn.addVirtualAuthenticator', { options: authOpts }) }
  return { ctx, page, cdp }
}
async function passwordStart(page, email) {
  await page.goto(ORIGIN + '/portal/sign-in')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(PASSWORD)
}

// ---- set up: an authenticator-app account (secret kept for sign-in) and a passkey account (authenticator kept) ----
dropSessions(EMAIL_TOTP); dropSessions(EMAIL_PK)
let secret
{
  const { ctx, page } = await newCtx(false)
  await passwordStart(page, EMAIL_TOTP)
  await page.getByRole('button', { name: 'Sign in with password' }).click()
  await page.waitForURL('**/portal/enrol')
  await page.getByLabel('Your password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Show the setup key' }).click()
  const keyEl = page.getByText(/^[A-Z2-7 ]{16,}$/).first(); await keyEl.waitFor()
  secret = (await keyEl.innerText()).replace(/\s/g, '')
  await page.getByLabel('Six-digit code from the app').fill(await nextCode(secret))
  await page.getByRole('button', { name: 'Confirm the app' }).click()
  await page.getByText('Your authenticator app is confirmed.').waitFor()
  await ctx.close()
}
const pk = await newCtx(true)
{
  const { page } = pk
  await passwordStart(page, EMAIL_PK)
  await page.getByRole('button', { name: 'Sign in with password' }).click()
  await page.waitForURL('**/portal/enrol')
  await page.getByRole('button', { name: 'Add a passkey' }).click()
  await page.getByText('Your passkey is saved.').waitFor()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.waitForURL('**/portal/sign-in')
}
dropSessions(EMAIL_TOTP); dropSessions(EMAIL_PK)

// ---- A: ticked, password then code ----
await sleep(11000)
{
  const { ctx, page } = await newCtx(false)
  await page.goto(ORIGIN + '/portal/sign-in')
  const box = page.getByLabel('This is a shared computer')
  rec('A1 the checkbox is on the sign-in page with its hint', (await box.count()) === 1 && /15 minutes/.test(await page.locator('#shared-hint').innerText()), await page.locator('#shared-hint').innerText())
  // keyboard: the checkbox can be reached with Tab and toggled with Space
  let reached = false
  for (let i = 0; i < 8 && !reached; i++) { await page.keyboard.press('Tab'); reached = await page.evaluate(() => document.activeElement?.id === 'shared') }
  await page.keyboard.press('Space')
  rec('A2 keyboard only: Tab reaches the checkbox and Space ticks it', reached && (await box.isChecked()), reached ? 'ticked' : 'not reached')
  await page.getByLabel('Email address').fill(EMAIL_TOTP); await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in with password' }).click()
  await page.getByRole('heading', { name: 'Enter your authenticator code' }).waitFor({ timeout: 15000 })
  await page.getByLabel('Six-digit code').fill(await nextCode(secret))
  await page.getByRole('button', { name: 'Verify and sign in' }).click()
  await page.waitForURL('**/portal', { timeout: 20000 })
  rec('A3 the session is recorded as shared', sharedCount(EMAIL_TOTP) === 1, `${sharedCount(EMAIL_TOTP)} row`)
  idle(EMAIL_TOTP, 14); await page.goto(ORIGIN + '/portal')
  rec('A4 idle 14 minutes: still signed in', path(page) === '/portal', path(page))
  idle(EMAIL_TOTP, 16); await page.goto(ORIGIN + '/portal')
  rec('A5 idle 16 minutes: signed out with a plain notice', path(page) === '/portal/sign-in?reason=expired' && (await page.getByText(/session ended/i).count()) > 0, path(page))
  await ctx.close()
}

// ---- B: not ticked, same 16 minutes idle is fine ----
await sleep(11000)
{
  const { ctx, page } = await newCtx(false)
  await passwordStart(page, EMAIL_TOTP)
  await page.getByRole('button', { name: 'Sign in with password' }).click()
  await page.getByRole('heading', { name: 'Enter your authenticator code' }).waitFor({ timeout: 15000 })
  await page.getByLabel('Six-digit code').fill(await nextCode(secret))
  await page.keyboard.press('Enter')
  await page.waitForURL('**/portal', { timeout: 20000 })
  rec('B1 without the tick the session is not shared', sharedCount(EMAIL_TOTP) === 0, `${sharedCount(EMAIL_TOTP)} rows`)
  idle(EMAIL_TOTP, 16); await page.goto(ORIGIN + '/portal')
  rec('B2 idle 16 minutes: still signed in', path(page) === '/portal', path(page))
  idle(EMAIL_TOTP, 31); await page.goto(ORIGIN + '/portal')
  rec('B3 idle 31 minutes: signed out (the normal limit is unchanged)', path(page) === '/portal/sign-in?reason=expired', path(page))
  await ctx.close()
}

// ---- C: ticked, then unticked before signing in: not shared ----
await sleep(11000)
{
  const { ctx, page } = await newCtx(false)
  await page.goto(ORIGIN + '/portal/sign-in')
  await page.getByLabel('This is a shared computer').check()
  await page.getByLabel('This is a shared computer').uncheck()
  await page.getByLabel('Email address').fill(EMAIL_TOTP); await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in with password' }).click()
  await page.getByRole('heading', { name: 'Enter your authenticator code' }).waitFor({ timeout: 15000 })
  await page.getByLabel('Six-digit code').fill(await nextCode(secret))
  await page.keyboard.press('Enter')
  await page.waitForURL('**/portal', { timeout: 20000 })
  rec('C1 ticking then unticking leaves the session not shared', sharedCount(EMAIL_TOTP) === 1 ? false : true, `${sharedCount(EMAIL_TOTP)} shared rows`)
  await ctx.close()
}

// ---- D: ticked, passkey sign-in ----
dropSessions(EMAIL_PK)
await sleep(11000)
{
  const { page, ctx } = pk
  await page.goto(ORIGIN + '/portal/sign-in')
  await page.getByLabel('This is a shared computer').check()
  await page.getByRole('button', { name: 'Sign in with a passkey' }).click()
  await page.waitForURL('**/portal', { timeout: 20000 })
  rec('D1 passkey sign-in with the tick records a shared session', sharedCount(EMAIL_PK) === 1, `${sharedCount(EMAIL_PK)} row`)
  idle(EMAIL_PK, 16); await page.goto(ORIGIN + '/portal')
  rec('D2 and it ends after 16 minutes idle', path(page) === '/portal/sign-in?reason=expired', path(page))
  await ctx.close()
}

fs.writeFileSync(OUT, JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
