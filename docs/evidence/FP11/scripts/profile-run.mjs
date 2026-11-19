/**
 * FP-11: the profile screens driven in Chromium (virtual authenticator, no hardware) against the running app.
 * Env: ORIGIN, EMAIL1, EMAIL2 (two users made with seed-user.ts), PASSWORD, OUT (results json path), SHOTS (screenshot folder).
 * Elements are found by role and label.
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, EMAIL1, EMAIL2, PASSWORD, OUT, SHOTS } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const browser = await chromium.launch()
const path = (page) => new URL(page.url()).pathname + new URL(page.url()).search

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

// ---- Signed-out visitor
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(ORIGIN + '/portal/profile')
  rec('P0 a signed-out visitor to /portal/profile is sent to sign-in', path(page) === '/portal/sign-in', path(page))
  await ctx.close()
}

// ---- Account A
const A = await signedIn(EMAIL1)
const page = A.page
await page.getByRole('link', { name: 'Edit your profile' }).click()
await page.waitForURL('**/portal/profile')
const preview = page.getByTestId('public-preview')
rec('P1 profile page: one h1, Sample badge, sample note, not-saved status', (await page.getByRole('heading', { level: 1 }).count()) === 1 && (await page.getByRole('heading', { level: 1 }).textContent()).includes('Sample') && (await page.getByRole('note').allInnerTexts()).some((t) => /sample data/.test(t)) && /not saved anything/.test(await page.getByTestId('profile-status').innerText()), await page.title())
rec('P2 fixed fields are listed as text, not as inputs', (await page.getByLabel('Designation').count()) === 0 && (await page.getByText('Lecturer (sample)').count()) > 0 && (await page.getByText('Set by the university').count()) === 1, 'designation shown read-only')
rec('P3 preview starts with no email and no photo', !(await preview.innerText()).includes(EMAIL1) && /No photo would be shown/.test(await preview.innerText()), 'hidden by default')

const urdu = page.getByLabel('About you, in Urdu')
rec('P4 the Urdu field is right-to-left and tagged lang=ur', (await urdu.getAttribute('dir')) === 'rtl' && (await urdu.getAttribute('lang')) === 'ur', 'dir=rtl lang=ur')
await page.getByLabel('About you, in English').fill('I teach optics.')
await urdu.fill('میں بصریات پڑھاتا ہوں۔')
await page.getByLabel('Research interests').fill('optics, lasers, optics')
rec('P5 the preview updates as you type, Urdu preview is rtl, duplicates removed', (await preview.innerText()).includes('I teach optics.') && (await preview.locator('p[lang=ur]').getAttribute('dir')) === 'rtl' && (await preview.innerText()).includes('optics, lasers') && !(await preview.innerText()).includes('optics, lasers, optics'), 'live preview')
await page.getByLabel('Who can see your email address').selectOption('public')
rec('P6 email appears in the preview only when set to Public', (await preview.innerText()).includes(EMAIL1), 'public shows')
await page.getByLabel('Who can see your email address').selectOption('internal')
rec('P7 Internal hides it from the public preview', !(await preview.innerText()).includes(EMAIL1), 'internal hidden')
await page.getByLabel('Who can see your email address').selectOption('hidden')
await page.getByLabel('Who can see your photo').selectOption('public')
rec('P8 photo shown in preview only when Public', /photo would be shown/.test(await preview.innerText()), 'photo public')
await page.getByLabel('Who can see your photo').selectOption('hidden')

// invalid input
await page.getByLabel('ORCID iD').fill('0000-0002-1825-0098')
await page.getByRole('button', { name: 'Save draft' }).click()
await page.getByRole('alert').filter({ hasText: 'need attention' }).first().waitFor({ timeout: 10000 })
const orcid = page.getByLabel('ORCID iD')
rec('P9 a wrong ORCID checksum is refused with a linked message and nothing is saved', (await orcid.getAttribute('aria-invalid')) === 'true' && /not valid/.test(await page.locator(`#${await orcid.getAttribute('id')}-err`).innerText()) && /not saved anything/.test(await page.getByTestId('profile-status').innerText()), 'aria-invalid set')
await page.getByLabel('Google Scholar link').fill('http://scholar.google.com/x')
await orcid.fill('0000-0002-1825-0097')
await page.getByRole('button', { name: 'Save draft' }).click()
await page.getByLabel('Google Scholar link').and(page.locator('[aria-invalid=true]')).waitFor({ timeout: 10000 })
rec('P10 an http Scholar link is refused', (await page.getByLabel('Google Scholar link').getAttribute('aria-invalid')) === 'true', 'refused')
await page.getByLabel('Google Scholar link').fill('https://scholar.google.com/citations?user=abc')

// capture the real action request, then tamper with it
let captured = null
page.on('request', (r) => { if (r.method() === 'POST' && r.headers()['next-action'] && (r.postData() ?? '').includes('researchInterests')) captured = { url: r.url(), headers: r.headers(), body: r.postData() } })
await page.getByRole('button', { name: 'Save draft' }).click()
await page.getByTestId('profile-message').filter({ hasText: 'Draft saved.' }).waitFor({ timeout: 10000 })
rec('P11 a valid save shows the draft status', /Saved as a draft/.test(await page.getByTestId('profile-status').innerText()), 'draft')
await page.screenshot({ path: `${SHOTS}/profile-desktop.png`, fullPage: true })
await page.reload()
rec('P12 values persist after a reload (Urdu intact)', (await page.getByLabel('About you, in Urdu').inputValue()) === 'میں بصریات پڑھاتا ہوں۔' && (await page.getByLabel('Research interests').inputValue()) === 'optics, lasers' && (await page.getByLabel('ORCID iD').inputValue()) === '0000-0002-1825-0097', 'reloaded')

// crafted requests replayed with the session cookie
if (captured) {
  const send = async (obj) => {
    const res = await page.request.post(captured.url, { headers: { 'content-type': captured.headers['content-type'] ?? 'text/plain;charset=UTF-8', 'next-action': captured.headers['next-action'], accept: 'text/x-component' }, data: JSON.stringify([obj]) })
    return await res.text()
  }
  const edit = JSON.parse(captured.body)[0]
  const tampered = await send({ ...edit, designation: 'Vice Chancellor' })
  rec('P13 a crafted request carrying a high-impact field is refused as read-only', /"designation":"read-only"/.test(tampered) && /"error":"invalid"/.test(tampered), tampered.slice(0, 160).replace(/\s+/g, ' '))
  const withId = await send({ ...edit, userId: 'someone-else' })
  rec('P14 a crafted request carrying another account id is refused', /"userId":"unknown"/.test(withId), withId.slice(0, 160).replace(/\s+/g, ' '))
  await page.reload()
  rec('P15 after the crafted requests the designation is unchanged', (await page.getByText('Lecturer (sample)').count()) > 0 && (await page.getByText('Vice Chancellor').count()) === 0, 'unchanged')
} else rec('P13 crafted request', false, 'could not capture the action request')

// submit and lock
await page.getByRole('button', { name: 'Save and send for review' }).click()
await page.getByTestId('profile-message').filter({ hasText: 'Sent for review.' }).waitFor({ timeout: 10000 })
rec('P16 submitting locks the form and offers to take it back', /cannot change it/.test(await page.getByTestId('profile-status').innerText()) && (await page.getByLabel('About you, in English').isDisabled()) && (await page.getByRole('button', { name: 'Take it back to edit' }).count()) === 1, 'locked')
if (captured) {
  const edit = JSON.parse(captured.body)[0]
  const res = await page.request.post(captured.url, { headers: { 'content-type': captured.headers['content-type'] ?? 'text/plain;charset=UTF-8', 'next-action': captured.headers['next-action'], accept: 'text/x-component' }, data: JSON.stringify([{ ...edit, officeLocation: 'sneaky' }]) })
  rec('P17 a crafted save while submitted is refused as locked', /"error":"locked"/.test(await res.text()), 'locked')
}
await page.getByRole('button', { name: 'Take it back to edit' }).click()
await page.getByTestId('profile-message').filter({ hasText: 'Taken back.' }).waitFor({ timeout: 10000 })
rec('P18 taking it back re-enables editing', await page.getByLabel('About you, in English').isEnabled(), 'editable')

// keyboard only
await page.getByLabel('Research interests').focus()
let reached = false
for (let i = 0; i < 40 && !reached; i++) {
  await page.keyboard.press('Tab')
  reached = await page.evaluate(() => document.activeElement?.textContent?.trim() === 'Save draft')
}
await page.keyboard.press('Enter')
await page.getByTestId('profile-message').filter({ hasText: 'Draft saved.' }).waitFor({ timeout: 10000 })
rec('P19 the Save button is reachable by Tab and works with Enter', reached, 'keyboard')
await A.ctx.close()

// phone width
{
  const ph = await signedIn(EMAIL2, { width: 390, height: 800 })
  await ph.page.goto(ORIGIN + '/portal/profile')
  await ph.page.getByRole('heading', { level: 1 }).waitFor()
  const overflow = await ph.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  rec('P20 no horizontal scroll at 390 px wide', overflow <= 0, `overflow ${overflow}px`)
  rec('P21 a second account sees only its own (empty) profile', /not saved anything/.test(await ph.page.getByTestId('profile-status').innerText()) && (await ph.page.getByLabel('About you, in English').inputValue()) === '' && (await ph.page.getByText('optics').count()) === 0, 'account B is empty')
  await ph.page.screenshot({ path: `${SHOTS}/profile-phone.png`, fullPage: true })
  await ph.ctx.close()
}
fs.writeFileSync(OUT, JSON.stringify(results, null, 2))
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
