/**
 * FP-7: the portal pages driven in Chromium (CDP virtual authenticator, no hardware) against the running app.
 * Env: ORIGIN, EMAIL1 / EMAIL2 / EMAIL3 (three users made with seed-user.ts), PASSWORD, OUT (results json path).
 * Elements are found by role and label, the way a person using a screen reader or keyboard finds them.
 */
import { createRequire } from 'node:module'
import { createHmac } from 'node:crypto'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, EMAIL1, EMAIL2, EMAIL3, PASSWORD, OUT } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const browser = await chromium.launch()

function b32decode(s) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = ''
  for (const c of s.replace(/[\s=]/g, '').toUpperCase()) bits += A.indexOf(c).toString(2).padStart(5, '0')
  const out = []; for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2))
  return Buffer.from(out)
}
function totp(secret, stepOffset = 0) {
  const counter = Math.floor(Date.now() / 30000) + stepOffset
  const buf = Buffer.alloc(8); buf.writeBigUInt64BE(BigInt(counter))
  const h = createHmac('sha1', b32decode(secret)).update(buf).digest()
  const o = h[19] & 15
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000)).padStart(6, '0')
}
async function fresh(withAuthenticator) {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  if (withAuthenticator) {
    await cdp.send('WebAuthn.enable')
    await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } })
  }
  return { ctx, page, cdp }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
// The library's own per-address limiter (3 sign-ins per 10 s) is on in a production build; space the sign-ins out.
const path = (page) => new URL(page.url()).pathname + new URL(page.url()).search
const passwordSignIn = async (page, email) => {
  await page.goto(ORIGIN + '/portal/sign-in')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in with password' }).click()
}

// ---- A: passkey enrolment, recovery codes, sign out, passkey sign-in ------------------------------------
{
  const { page, ctx } = await fresh(true)
  await page.goto(ORIGIN + '/portal')
  rec('A1 signed-out visitor to /portal is sent to sign-in', path(page) === '/portal/sign-in', path(page))
  rec('A2 page has lang, a title, one h1, skip link, sample banner, noindex', 
    (await page.locator('html').getAttribute('lang')) === 'en' && /Sign in/.test(await page.title()) && (await page.getByRole('heading', { level: 1 }).count()) === 1
    && (await page.getByRole('link', { name: 'Skip to the main content' }).count()) === 1 && /Sample portal/.test(await page.getByRole('note').innerText())
    && (await page.locator('meta[name=robots]').getAttribute('content')).includes('noindex'), await page.title())
  await passwordSignIn(page, EMAIL1)
  await page.waitForURL('**/portal/enrol', { timeout: 15000 })
  rec('A3 password sign-in with no factor lands on the enrol page', path(page) === '/portal/enrol', path(page))
  await page.getByRole('button', { name: 'Add a passkey' }).click()
  await page.getByText('Your passkey is saved.').waitFor({ timeout: 15000 })
  rec('A4 passkey added with the virtual authenticator', true, 'confirmation shown')
  await page.getByRole('button', { name: 'Get my recovery codes' }).click()
  await page.getByRole('list', { name: 'Save your recovery codes' }).waitFor()
  const codes = await page.getByRole('list', { name: 'Save your recovery codes' }).getByRole('listitem').allInnerTexts()
  rec('A5 ten recovery codes shown once', codes.length === 10, `${codes.length} codes`)
  const cont = page.getByRole('button', { name: 'Continue to the portal' })
  rec('A6 Continue stays disabled until the codes are confirmed saved', await cont.isDisabled(), 'disabled')
  await page.getByLabel('I have saved these codes').check()
  await cont.click()
  await page.waitForURL('**/portal', { timeout: 15000 })
  rec('A7 home shows the signed-in email', (await page.getByText(EMAIL1).count()) > 0, path(page))
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.waitForURL('**/portal/sign-in')
  await page.goto(ORIGIN + '/portal')
  rec('A8 after sign-out /portal needs sign-in again', path(page) === '/portal/sign-in', path(page))
  await page.getByRole('button', { name: 'Sign in with a passkey' }).click()
  await page.waitForURL('**/portal', { timeout: 15000 })
  rec('A9 passkey sign-in reaches the portal', path(page) === '/portal', path(page))
  await page.goto(ORIGIN + '/portal/sign-in')
  rec('A10 a signed-in person visiting sign-in is sent home', path(page) === '/portal', path(page))
  fs.writeFileSync(OUT.replace(/\.json$/, '') + '-codes.tmp', JSON.stringify(codes))
  await ctx.close()
}

// ---- B: TOTP enrolment, sign-in with the code, keyboard only ----------------------------------------------
let recoveryCodes = []
{
  const { page, ctx } = await fresh(false)
  await passwordSignIn(page, EMAIL2)
  await page.waitForURL('**/portal/enrol', { timeout: 15000 })
  await page.getByLabel('Your password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Show the setup key' }).click()
  const keyEl = page.getByText(/^[A-Z2-7 ]{16,}$/).first()
  await keyEl.waitFor({ timeout: 15000 })
  const secret = (await keyEl.innerText()).replace(/\s/g, '')
  rec('B1 setup key shown as text with an otpauth link and no QR needed', secret.length >= 16 && (await page.getByRole('link', { name: /setup link/ }).getAttribute('href')).startsWith('otpauth://totp/'), `${secret.length} chars`)
  await page.getByLabel('Six-digit code from the app').fill(totp(secret))
  await page.getByRole('button', { name: 'Confirm the app' }).click()
  await page.getByText('Your authenticator app is confirmed.').waitFor({ timeout: 15000 })
  rec('B2 authenticator app confirmed', true, 'confirmation shown')
  await page.getByRole('button', { name: 'Get my recovery codes' }).click()
  await page.getByRole('list', { name: 'Save your recovery codes' }).waitFor()
  recoveryCodes = await page.getByRole('list', { name: 'Save your recovery codes' }).getByRole('listitem').allInnerTexts()
  rec('B2b ten recovery codes after TOTP enrolment too', recoveryCodes.length === 10, `${recoveryCodes.length} codes`)
  await page.getByLabel('I have saved these codes').check()
  await page.getByRole('button', { name: 'Continue to the portal' }).click()
  await page.waitForURL('**/portal')
  await ctx.close()

  await sleep(11000)
  const k = await fresh(false)
  await k.page.goto(ORIGIN + '/portal/sign-in')
  // keyboard only: Tab to the email field, type, Tab, type, Enter
  await k.page.getByLabel('Email address').focus()
  await k.page.keyboard.type(EMAIL2)
  await k.page.keyboard.press('Tab'); await k.page.keyboard.type(PASSWORD); await k.page.keyboard.press('Enter')
  await k.page.getByRole('heading', { name: 'Enter your authenticator code' }).waitFor({ timeout: 15000 })
  rec('B3 password step moves to the code step and focuses the code field', await k.page.evaluate(() => document.activeElement?.id) === 'code', 'focus on code')
  await k.page.keyboard.type(totp(secret, 1)); await k.page.keyboard.press('Enter')
  await k.page.waitForURL('**/portal', { timeout: 20000 })
  rec('B4 TOTP sign-in with the keyboard only reaches the portal', path(k.page) === '/portal', path(k.page))
  await k.ctx.close()
}

// ---- C: wrong credentials, recovery code ------------------------------------------------------------------
await sleep(11000)
{
  const { page, ctx } = await fresh(false)
  await page.goto(ORIGIN + '/portal/sign-in')
  await page.getByLabel('Email address').fill(EMAIL2)
  await page.getByLabel('Password').fill('not-the-password-1')
  await page.getByRole('button', { name: 'Sign in with password' }).click()
  const alert = page.locator('.portal-error')
  await alert.waitFor({ timeout: 15000 })
  rec('C1 wrong password shows one plain error, focus moves to it', /not right/.test(await alert.innerText()) && await page.evaluate(() => document.activeElement?.className) === 'portal-error', await alert.innerText())
  await page.getByRole('link', { name: /recovery code/ }).click()
  await page.waitForURL('**/portal/recover')
  await page.getByLabel('Email address').fill(EMAIL2)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByLabel('Recovery code').fill('WRONG-CODE1')
  await page.getByRole('button', { name: 'Sign in with the code' }).click()
  await page.locator('.portal-error').waitFor({ timeout: 15000 })
  rec('C2 wrong recovery code shows the shared error', /recovery code is not right/.test(await page.locator('.portal-error').innerText()), await page.locator('.portal-error').innerText())
  await page.getByLabel('Recovery code').fill(recoveryCodes[0])
  await page.getByRole('button', { name: 'Sign in with the code' }).click()
  await page.waitForURL(/\/portal(\/enrol)?$/, { timeout: 20000 })
  rec('C3 a real recovery code signs in', /^\/portal/.test(path(page)), path(page))
  await ctx.close()
}

// ---- D: the portal's pages never touch the public site's chrome -------------------------------------------
{
  const { page, ctx } = await fresh(false)
  await page.goto(ORIGIN + '/portal/sign-in')
  const html = await page.content()
  rec('D1 portal page loads none of the public-site stylesheet classes', !/class="[^"]*\b(topbar|site-header|hero)\b/.test(html), 'no site chrome classes found')
  await page.goto(ORIGIN + '/')
  rec('D2 public home is unaffected and has no portal banner', (await page.getByText('Sample portal for demonstration').count()) === 0, 'public home ok')
  await ctx.close()
}

fs.writeFileSync(OUT, JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2))
fs.rmSync(OUT.replace(/\.json$/, '') + '-codes.tmp', { force: true })
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
