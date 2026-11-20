/**
 * FP-20: the CV page driven in Chromium (virtual authenticator) against the running app.
 * Env: ORIGIN, EMAIL1, EMAIL2, PASSWORD, DBURL, OUT, SHOTS, PDFDIR.
 * Data is seeded straight into the local test database (sample rows only, reserved example.invalid addresses).
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, EMAIL1, EMAIL2, PASSWORD, DBURL, OUT, SHOTS, PDFDIR } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const sql = (q) => execFileSync('psql', [DBURL, '-tAc', q]).toString().trim()
const browser = await chromium.launch()
fs.mkdirSync(PDFDIR, { recursive: true })

async function signedIn(email, viewport) {
  const ctx = await browser.newContext({ acceptDownloads: true, ...(viewport ? { viewport } : {}) })
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
const uid = (email) => sql(`select id from identity."user" where email = '${email}'`)
const esc = (s) => s.replace(/'/g, "''")
function work(user, title, year, status, n) {
  sql(`insert into identity.publication_candidate ("userId","doiKey","titleKey","title","year","venue","authors","status","sample") values ('${user}', '10.5555/cv${n}', '${esc(title.toLowerCase())}', '${esc(title)}', ${year}, 'Sample Journal', '["A. Sample"]', '${status}', true)`)
}
function course(user, code, title, season, year) {
  sql(`insert into identity.course_taught ("userId","code","title","season","year","programme") values ('${user}','${code}','${esc(title)}','${season}',${year},'BS Physics')`)
}

// --- signed out
{
  const ctx = await browser.newContext(); const page = await ctx.newPage()
  await page.goto(ORIGIN + '/portal/cv')
  rec('R0 a signed-out visitor to the CV page is sent to sign-in', new URL(page.url()).pathname === '/portal/sign-in', page.url())
  const r = await ctx.request.get(ORIGIN + '/portal/cv/word?template=hec')
  const body = await r.text()
  rec('R1 a signed-out request for the Word file gets 401 and no CV content', r.status() === 401 && !/Sample User|cv-document/.test(body), `status ${r.status()}, body "${body.slice(0, 40)}"`)
  await ctx.close()
}

const A = await signedIn(EMAIL1)
const page = A.page
const idA = uid(EMAIL1)
work(idA, 'Claimed Optics Paper', 2022, 'claimed', 1)
work(idA, 'Older Laser Paper', 2019, 'claimed', 2)
work(idA, 'Pending Paper Zzz', 2024, 'pending', 3)
work(idA, 'Rejected Paper Yyy', 2023, 'rejected', 4)
course(idA, 'PHY 101', 'Optics', 'Fall', 2025)
course(idA, 'PHY 202', 'Lasers', 'Spring', 2026)

await page.getByRole('link', { name: 'Make your CV' }).click()
await page.waitForURL('**/portal/cv')
const doc = page.getByTestId('cv-document')
const text = async () => (await doc.innerText())
rec('R2 one h1 on the page (the CV name), the Sample label, and the university layout by default',
  (await page.getByRole('heading', { level: 1 }).count()) === 1 && (await page.getByText('Sample CV: built from demonstration data').count()) >= 1 && (await page.locator('.cv-university').count()) === 1 && (await page.getByRole('link', { name: 'University layout' }).getAttribute('aria-current')) === 'page',
  `h1 "${await page.getByRole('heading', { level: 1 }).textContent()}"`)
const t1 = await text()
rec('R3 claimed works are listed newest first; pending and rejected are not', t1.indexOf('Claimed Optics Paper') > -1 && t1.indexOf('Claimed Optics Paper') < t1.indexOf('Older Laser Paper') && !t1.includes('Pending Paper Zzz') && !t1.includes('Rejected Paper Yyy'), 'order and exclusions checked')
rec('R4 courses are listed newest semester first', t1.indexOf('PHY 202') > -1 && t1.indexOf('PHY 202') < t1.indexOf('PHY 101'), 'Spring 2026 before Fall 2025')
rec('R5 the email is not on the CV until the profile makes it Public, and the page says why', !t1.includes(EMAIL1) && (await page.getByText(/left out because it is not set to Public/).count()) >= 1, 'hidden by default')
{ const notes = await doc.locator('.cv-trust').count(); const heads = await doc.locator('h2').count(); rec('R6 the header and every section carry a trust note', notes === heads + 1 && notes >= 3, `${notes} notes, ${heads} sections`) }
await page.screenshot({ path: `${SHOTS}/cv-university.png`, fullPage: true })

// --- HEC layout
await page.getByRole('link', { name: 'HEC-style layout' }).click()
await page.waitForURL('**/portal/cv?template=hec')
const t2 = await text()
rec('R7 the HEC-style layout shows the same works in a numbered list, courses in a table with headers, and says it is not the official form',
  (await doc.locator('ol li').count()) === 2 && (await doc.locator('table th[scope="col"]').count()) === 4 && /not the official HEC form/.test(t2) && t2.includes('Claimed Optics Paper') && !t2.includes('Pending Paper Zzz'),
  `ol items ${await doc.locator('ol li').count()}`)
await page.screenshot({ path: `${SHOTS}/cv-hec.png`, fullPage: true })
rec('R7b an unknown layout value falls back to the university layout', await (async () => { await page.goto(ORIGIN + '/portal/cv?template=%3Cscript%3E'); return (await page.locator('.cv-university').count()) === 1 })(), 'fallback')

// --- email public
sql(`insert into identity.profile_draft ("userId","edit","status") values ('${idA}', '{"visibility":{"email":"public","photo":"hidden"}}', 'draft') on conflict ("userId") do update set "edit" = excluded."edit"`)
await page.goto(ORIGIN + '/portal/cv?template=hec')
rec('R8 once the profile makes the email Public it appears on the CV', (await doc.innerText()).includes(EMAIL1), 'email shown')

// --- Word file
{
  const url = ORIGIN + '/portal/cv/word?template=hec'
  const r = await A.ctx.request.get(url)
  const h = r.headers(); const body = await r.text()
  rec('R9 the Word file: 200, application/msword, attachment named cv-hec.doc, no-store, nosniff',
    r.status() === 200 && h['content-type'].startsWith('application/msword') && h['content-disposition'] === 'attachment; filename="cv-hec.doc"' && h['cache-control'].includes('no-store') && h['x-content-type-options'] === 'nosniff', `${r.status()} ${h['content-type']} ${h['content-disposition']}`)
  rec('R10 the Word body is a full HTML document with the claimed works, the courses and the sample label, and without pending works', body.startsWith('<!doctype html>') && body.includes('Claimed Optics Paper') && body.includes('PHY 202') && body.includes('Sample CV') && !body.includes('Pending Paper Zzz'), `${body.length} bytes`)
  const bad = await A.ctx.request.get(ORIGIN + '/portal/cv/word?template=nope')
  rec('R11 an unknown layout for the Word file is refused with 400', bad.status() === 400, `status ${bad.status()}`)
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Download for Word' }).click()])
  rec('R12 the Download for Word link saves cv-hec.doc', dl.suggestedFilename() === 'cv-hec.doc', dl.suggestedFilename())
}

// --- print and PDF
for (const t of ['university', 'hec']) {
  await page.goto(ORIGIN + `/portal/cv?template=${t}`)
  await page.emulateMedia({ media: 'print' })
  const hidden = await page.evaluate(() => ['.portal-banner', '.portal-head', '.cv-tools'].map((s) => { const e = document.querySelector(s); return !e || getComputedStyle(e).display === 'none' }))
  const file = `${PDFDIR}/cv-${t}.pdf`
  await page.pdf({ path: file, format: 'A4', tagged: true, printBackground: true })
  const info = execFileSync('pdfinfo', [file]).toString()
  const pages = Number(/Pages:\s+(\d+)/.exec(info)[1]); const tagged = /Tagged:\s+yes/.test(info)
  const txt = execFileSync('pdftotext', ['-layout', file, '-']).toString()
  rec(`R13-${t} PDF: print hides the header, banner and tools; tagged; text extractable; page count`, hidden.every(Boolean) && tagged && txt.includes('Claimed Optics Paper') && txt.includes('PHY 202') && !txt.includes('Print or save as PDF') && pages <= 2, `hidden ${hidden}, tagged ${tagged}, pages ${pages}`)
  await page.emulateMedia({ media: 'screen' })
}

// --- phone width
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } })
  const cookies = await A.ctx.cookies(); await ctx.addCookies(cookies)
  const p = await ctx.newPage()
  for (const t of ['university', 'hec']) {
    await p.goto(ORIGIN + `/portal/cv?template=${t}`)
    await p.getByTestId('cv-document').waitFor()
    const w = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
    rec(`R14-${t} at 390 px the page does not scroll sideways`, w.sw <= w.iw, `scrollWidth ${w.sw}, innerWidth ${w.iw}`)
    await p.screenshot({ path: `${SHOTS}/cv-${t}-390.png`, fullPage: true })
  }
  await ctx.close()
}

// --- another account
{
  await new Promise((r) => setTimeout(r, 11000)) // the library limits sign-ins to 3 per 10 s per address
  const B = await signedIn(EMAIL2)
  const idB = uid(EMAIL2)
  work(idB, 'Other Persons Paper', 2021, 'claimed', 5)
  course(idB, 'CHM 300', 'Other Course', 'Fall', 2025)
  await B.page.goto(ORIGIN + '/portal/cv')
  const tb = await B.page.getByTestId('cv-document').innerText()
  rec('R15 another account sees only its own works and courses, never the first account\'s', tb.includes('Other Persons Paper') && tb.includes('CHM 300') && !tb.includes('Claimed Optics Paper') && !tb.includes('PHY 202') && !tb.includes(EMAIL1), 'isolation')
  const word = await (await B.ctx.request.get(ORIGIN + '/portal/cv/word')).text()
  rec('R16 the other account\'s Word file is also its own', word.includes('Other Persons Paper') && !word.includes('Claimed Optics Paper') && !word.includes(EMAIL1), 'isolation in the Word route')
  await B.ctx.close()
}
// --- empty account state
{
  const ctx = await browser.newContext(); const p = await ctx.newPage()
  await ctx.addCookies(await A.ctx.cookies())
  sql(`delete from identity.publication_candidate where "userId" = '${idA}'; delete from identity.course_taught where "userId" = '${idA}'`)
  await p.goto(ORIGIN + '/portal/cv')
  const te = await p.getByTestId('cv-document').innerText()
  rec('R17 with nothing claimed and no courses the CV says so instead of showing empty headings', te.includes('No claimed publications yet.') && te.includes('No courses listed yet.'), 'empty states')
  await ctx.close()
}
await A.ctx.close()
fs.writeFileSync(OUT, JSON.stringify(results, null, 2))
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
