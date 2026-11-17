/**
 * FP-7c: the security page in Chromium (virtual authenticator). Env: ORIGIN, EMAIL (a fresh user), PASSWORD, OUT.
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, EMAIL, PASSWORD, OUT } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch()
const authOpts = { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true }
const path = (p) => new URL(p.url()).pathname

const ctx = await browser.newContext()
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
await cdp.send('WebAuthn.enable')
let { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: authOpts })

// enrol the first passkey and take the recovery codes
await page.goto(ORIGIN + '/portal/sign-in')
await page.getByLabel('Email address').fill(EMAIL)
await page.getByLabel('Password').fill(PASSWORD)
await page.getByRole('button', { name: 'Sign in with password' }).click()
await page.waitForURL('**/portal/enrol')
await page.getByRole('button', { name: 'Add a passkey' }).click()
await page.getByText('Your passkey is saved.').waitFor()
await page.getByRole('button', { name: 'Get my recovery codes' }).click()
await page.getByRole('list', { name: 'Save your recovery codes' }).waitFor()
const oldCodes = await page.getByRole('list', { name: 'Save your recovery codes' }).getByRole('listitem').allInnerTexts()
await page.getByLabel('I have saved these codes').check()
await page.getByRole('button', { name: 'Continue to the portal' }).click()
await page.waitForURL('**/portal')

// S1: the page, the only passkey cannot be removed
await page.getByRole('link', { name: 'Security', exact: true }).click()
await page.waitForURL('**/portal/security')
await page.getByRole('heading', { level: 1, name: 'Sign-in security' }).waitFor()
await page.getByText('Passkey 1').or(page.getByText('My passkey')).first().waitFor({ timeout: 10000 })
rec('S1a security page lists the one passkey', (await page.locator('#pk-h ~ ul > li').count()) === 1, 'one row')
rec('S1b no Remove button for the only second factor, and the reason is shown', (await page.getByRole('button', { name: /^Remove/ }).count()) === 0 && (await page.getByText(/cannot be removed/).count()) === 1, 'hidden + explained')
rec('S1c recovery code count shown', (await page.getByText('You have 10 recovery codes left.').count()) === 1, 'ten left')

// S2: add a second passkey (a second virtual authenticator, because the first already holds the credential)
await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
;({ authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: authOpts }))
await page.getByRole('button', { name: 'Add another passkey' }).click()
await page.waitForFunction(() => document.querySelectorAll('#pk-h ~ ul > li').length === 2, null, { timeout: 15000 })
rec('S2a a second passkey is added and listed', true, 'two rows')
rec('S2b with two passkeys each has a Remove button', (await page.getByRole('button', { name: /^Remove/ }).count()) === 2, 'two buttons')

// S3: remove one (accept the confirm dialog)
page.once('dialog', (d) => d.accept())
await page.getByRole('button', { name: /^Remove/ }).first().click()
await page.waitForFunction(() => document.querySelectorAll('#pk-h ~ ul > li').length === 1, null, { timeout: 15000 })
rec('S3 removing one passkey leaves one, and the Remove button disappears again', (await page.getByRole('button', { name: /^Remove/ }).count()) === 0, 'one row, no button')

// S4: regenerate recovery codes; the old ones stop working
await page.getByRole('button', { name: 'Make new recovery codes' }).click()
await page.getByRole('list', { name: 'Recovery codes' }).waitFor({ timeout: 15000 })
const newCodes = await page.getByRole('list', { name: 'Recovery codes' }).getByRole('listitem').allInnerTexts()
rec('S4a ten new codes shown, none equal to the old ones', newCodes.length === 10 && newCodes.every((c) => !oldCodes.includes(c)), `${newCodes.length} codes`)

// S5: a second device, then revoke it from this one
const ctx2 = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' })
const page2 = await ctx2.newPage()
const cdp2 = await ctx2.newCDPSession(page2)
await cdp2.send('WebAuthn.enable')
await cdp2.send('WebAuthn.addVirtualAuthenticator', { options: authOpts })
await sleep(11000)
await page2.goto(ORIGIN + '/portal/sign-in')
await page2.getByLabel('Email address').fill(EMAIL)
await page2.getByLabel('Password').fill(PASSWORD)
await page2.getByRole('button', { name: 'Sign in with password' }).click()
await page2.waitForURL(/\/portal\/(enrol|sign-in)/, { timeout: 15000 })
// This account now has a factor, so the password alone must not get the second device in (AUTH-01).
rec('S5a a second device with the password alone is not let in', /sign-in|enrol/.test(path(page2)) && path(page2) !== '/portal', path(page2))
await page2.goto(ORIGIN + '/portal/sign-in')
// Passkey sign-in on the second device is impossible (its authenticator has no credential), so use a recovery code instead.
await page2.goto(ORIGIN + '/portal/recover')
await page2.getByLabel('Email address').fill(EMAIL)
await page2.getByLabel('Password').fill(PASSWORD)
await page2.getByLabel('Recovery code').fill(newCodes[0])
await page2.getByRole('button', { name: 'Sign in with the code' }).click()
await page2.waitForURL(/\/portal(\/enrol)?$/, { timeout: 20000 })
rec('S5b second device signs in with a new recovery code', true, path(page2))
// A recovery-code sign-in ends every other session (FPR copy says so): device 1 must be signed out now.
await page.goto(ORIGIN + '/portal/security')
rec('S5b2 the recovery-code sign-in signed this first device out', path(page) === '/portal/sign-in', path(page))
await sleep(11000)
await page.getByRole('button', { name: 'Sign in with a passkey' }).click()
await page.waitForURL('**/portal', { timeout: 20000 })
await page.goto(ORIGIN + '/portal/security')
await page.getByRole('button', { name: /^Sign this device out/ }).first().waitFor({ timeout: 15000 })
const row = await page.locator('#ss-h ~ ul > li').allInnerTexts()
rec('S5c this device is marked and the other shows browser and system in words', row.some((t) => /This device/.test(t)) && row.some((t) => /Chrome on Windows/.test(t)), JSON.stringify(row).slice(0, 160))
await page.getByRole('button', { name: /^Sign this device out/ }).first().click()
await page.getByText('No other devices are signed in.').waitFor({ timeout: 15000 })
await page2.goto(ORIGIN + '/portal/security')
rec('S5d the revoked device is sent to sign-in', path(page2) === '/portal/sign-in', path(page2))
rec('S5e this device is still signed in', (await page.goto(ORIGIN + '/portal/security'), path(page) === '/portal/security'), path(page))

// S6: keyboard only: Tab to Make new codes? the page has reachable buttons in order
await page.goto(ORIGIN + '/portal/security')
await page.getByRole('heading', { name: 'Passkeys' }).waitFor()
let reached = false
for (let i = 0; i < 15 && !reached; i++) { await page.keyboard.press('Tab'); reached = await page.evaluate(() => /Add another passkey/.test(document.activeElement?.textContent ?? '')) }
rec('S6 the Add another passkey button is reachable with Tab', reached, reached ? 'focused' : 'not reached in 15 tabs')

fs.writeFileSync(OUT, JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
