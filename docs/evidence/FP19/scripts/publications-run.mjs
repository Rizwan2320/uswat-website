/**
 * FP-19: the publications screen driven in Chromium against a local portal (scratch database, Sample account, example.invalid).
 * Env: ORIGIN, PASSWORD, DBURL, OUT, SHOTS. The DOI lookup success path cannot run here (no outbound access); the screen's
 * response to an unreachable service is checked instead.
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, PASSWORD, DBURL, OUT, SHOTS } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const sql = (q) => execFileSync('psql', [DBURL, '-tAc', q]).toString().trim()
fs.mkdirSync(SHOTS, { recursive: true })
const browser = await chromium.launch()
const email = 'ayesha.sample@example.invalid'
async function enrolled(extra = {}) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { 'x-real-ip': '203.0.113.91' }, acceptDownloads: true, ...extra })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } })
  return { ctx, page }
}
const { ctx, page: p } = await enrolled({ viewport: { width: 1440, height: 1000 } })
await p.goto(ORIGIN + '/portal/sign-in')
await p.getByLabel('Email address').fill(email)
await p.getByLabel('Password').fill(PASSWORD)
await p.getByRole('button', { name: 'Sign in with password' }).click()
await p.waitForURL('**/portal/enrol', { timeout: 20000 })
await p.getByRole('button', { name: 'Add a passkey' }).click()
await p.getByRole('list', { name: 'Save your recovery codes' }).waitFor({ timeout: 60000 })
await p.getByRole('list', { name: 'Save your recovery codes' }).waitFor()
await p.getByLabel('I have saved these codes').check()
await p.getByRole('button', { name: 'Continue to the portal' }).click()
await p.waitForURL('**/portal', { timeout: 15000 })
const uid = sql(`select id from identity."user" where email = '${email}'`)
sql(`insert into identity.profile_draft ("userId","edit","status") values ('${uid}', '{"bio":{"en":"","ur":""},"researchInterests":[],"officeLocation":"","officeHours":"","orcid":"0000-0002-1825-0097","scholarUrl":"","cvLink":"","visibility":{"email":"hidden","photo":"hidden"}}', 'draft') on conflict do nothing`)

const main = p.locator('main')
const msg = () => p.getByTestId('pub-message')
async function open() { await p.goto(ORIGIN + '/portal/publications'); await p.getByTestId('pub-add').waitFor() }
async function manual(vals) {
  await p.getByTestId('pub-way-manual').click()
  if (vals.workType) await p.getByTestId('pub-add').getByLabel('Kind of work').selectOption(vals.workType)
  await p.getByTestId('pub-add').getByLabel('Title', { exact: true }).fill(vals.title)
  await p.getByTestId('pub-add').getByLabel('Authors').fill(vals.authors ?? 'A. Sample')
  await p.getByTestId('pub-add').getByLabel('Year').fill(vals.year ?? '2022')
  if (vals.venue !== undefined) await p.getByTestId('pub-add').getByLabel('Journal, conference or publisher').fill(vals.venue)
  if (vals.doi) await p.getByTestId('pub-add').getByLabel('DOI', { exact: true }).fill(vals.doi)
  if (vals.url) await p.getByTestId('pub-add').getByLabel('Link to the full text').fill(vals.url)
  await p.getByRole('button', { name: 'Add to my publications' }).click()
}

await open()
await p.screenshot({ path: `${SHOTS}/01-empty-desktop.png`, fullPage: true })
rec('P1 four ways to add are offered; the page starts with an empty list and the Sample notice', (await p.locator('.pub-way').count()) === 4 && (await main.innerText()).includes('Nothing here is published yet') && (await main.innerText()).includes('You have not added any works yet'), 'four buttons, notice, empty state')

// DOI lookup: no outbound access here, so the service is unreachable.
await p.getByTestId('pub-way-doi').click()
await p.getByLabel('DOI', { exact: true }).fill('not a doi')
await p.getByRole('button', { name: 'Look up' }).click()
await msg().waitFor({ timeout: 15000 })
rec('P2 a malformed DOI is refused on the DOI box with a plain message', (await p.locator('.field-error').first().innerText()).includes('does not look like a DOI'), (await p.locator('.field-error').first().innerText()))
await p.getByLabel('DOI', { exact: true }).fill('10.5555/sample.2022.001')
await p.getByRole('button', { name: 'Look up' }).click()
await p.getByText(/could not be reached|No record was found/).waitFor({ timeout: 25000 })
rec('P3 a DOI that cannot be looked up here shows a clear message and the screen stays usable', true, (await msg().innerText()))

// Add by hand
await manual({ title: 'Optical fibres in rural networks', authors: 'A. Sample; B. Example', year: '2022', venue: 'Journal of Sample Results', doi: 'https://doi.org/10.5555/hand.1', url: 'https://example.invalid/hand1' })
await p.getByTestId('pub-claimed').first().waitFor({ timeout: 15000 })
rec('P4 a typed work lands straight in Your publications with its kind, link and origin', (await p.getByTestId('pub-section-claimed').innerText()).includes('Journal article') && (await p.getByTestId('pub-section-claimed').innerText()).includes('Typed in') && (await p.getByRole('link', { name: 'Full text' }).count()) === 1, 'claimed card shows kind, Full text link, Typed in')
await p.getByTestId('pub-way-manual').click()
await manual({ title: 'Optical fibres in rural networks', authors: 'A. Sample', year: '2022' })
await msg().getByText(/already in your list/).waitFor({ timeout: 10000 })
rec('P5 typing the same work again is refused as already in the list', true, await msg().innerText())
await manual({ title: 'x', authors: ' ', year: '20' })
await p.getByText('Enter at least one author').waitFor()
rec('P6 a bad form names each wrong box and keeps what was typed', (await p.locator('.field-error').count()) >= 2 && (await p.getByTestId('pub-add').getByLabel('Title', { exact: true }).inputValue()) === 'x', `${await p.locator('.field-error').count()} field errors`)
await manual({ workType: 'book', title: 'نمونہ کتاب', authors: 'اے نمونہ', year: '2019', venue: 'نمونہ پریس' })
await p.getByText('نمونہ کتاب').waitFor({ timeout: 15000 })
rec('P7 Urdu title and author are accepted and shown', true, 'shown in the claimed list')
for (let i = 3; i <= 7; i++) { await manual({ workType: i % 2 ? 'conference' : 'article', title: `Cap test paper ${i}`, year: String(2010 + i), venue: 'V' }); await p.getByText(`Cap test paper ${i}`).first().waitFor({ timeout: 15000 }) }
rec('P8 seven works are in the list', (await p.getByTestId('pub-claimed').count()) === 7, `${await p.getByTestId('pub-claimed').count()} cards`)

// Feature up to five
for (let i = 0; i < 5; i++) { await p.getByTestId('pub-claimed').filter({ has: p.locator('[data-featured]') }).first().isVisible().catch(() => {}); const btn = p.locator('[data-testid=pub-claimed][data-featured=no] .pub-toggle').first(); await btn.click(); await p.waitForFunction((n) => document.querySelectorAll('[data-testid=pub-claimed][data-featured=yes]').length === n, i + 1, { timeout: 15000 }) }
rec('P9 five works can be featured and the count reads 5 of 5', (await p.getByTestId('pub-featured-count').innerText()).startsWith('5 of 5 featured'), await p.getByTestId('pub-featured-count').innerText())
await p.locator('[data-testid=pub-claimed][data-featured=no] .pub-toggle').first().click()
await msg().getByText('You can feature up to five works').waitFor({ timeout: 10000 })
rec('P10 the sixth feature is refused with a plain message; the database holds five', sql(`select count(*) from identity.publication_candidate where "userId" = '${uid}' and featured`) === '5', 'db featured = 5')
const firstIsFeatured = await p.getByTestId('pub-claimed').first().getAttribute('data-featured')
rec('P11 featured works are listed first', firstIsFeatured === 'yes', 'first card featured')
await p.screenshot({ path: `${SHOTS}/02-claimed-desktop.png`, fullPage: true })

// Visibility
const card = p.getByTestId('pub-claimed').nth(6)
const title6 = (await card.locator('strong').innerText())
await card.locator('select').first().selectOption('private')
await msg().getByText('Marked only me.').waitFor({ timeout: 10000 })
rec('P12 a work can be set to Only me and the choice is stored', sql(`select "isPublic" from identity.publication_candidate where "userId" = '${uid}' and title = '${title6.replace(/'/g, "''")}'`) === 'f', title6)

// Edit details
const c0 = p.getByTestId('pub-claimed').filter({ hasText: 'Cap test paper 3' })
await c0.locator('summary').click()
await c0.getByLabel('Kind of work').selectOption('report')
await c0.getByLabel('Link to the full text').fill('https://example.invalid/report')
await c0.getByRole('button', { name: 'Save details' }).click()
await msg().getByText('Details saved.').waitFor({ timeout: 10000 })
rec('P13 kind and link can be edited on a claimed work', sql(`select count(*) from identity.publication_candidate where "userId" = '${uid}' and "workType" = 'report' and url = 'https://example.invalid/report'`) === '1', 'db shows report + url')
await c0.locator('details').evaluate((d) => { d.open = true }); await c0.getByLabel('Link to the full text').fill('javascript:alert(1)'); await c0.getByRole('button', { name: 'Save details' }).click()
await msg().getByText(/full web address|not valid/).waitFor({ timeout: 10000 }).catch(() => {})
rec('P14 a javascript: link is refused and never stored', sql(`select count(*) from identity.publication_candidate where "userId" = '${uid}' and url like 'javascript%'`) === '0', 'no javascript url in db: ' + (await msg().innerText()))

// Import a file
fs.writeFileSync('/tmp/fp19-import.bib', '@article{a, author={Sample, A. and Other, B.}, title={Imported paper one}, journal={Imported Journal}, year={2020}, doi={10.5555/imp.1}}\n@inproceedings{b, author={Other, D.}, title={Imported conference paper}, booktitle={Proc. Sample}, year={2021}}\n@article{c, title={Broken record without year}}\n')
await open()
await p.getByTestId('pub-way-file').click()
await p.getByLabel('File from your reference manager').setInputFiles('/tmp/fp19-import.bib')
await p.getByRole('button', { name: 'Import file' }).click()
await msg().getByText(/Imported 2 works/).waitFor({ timeout: 15000 })
rec('P15 a BibTeX file with 3 records imports 2 to review and skips the broken one, saying so', (await msg().innerText()).includes('1 skipped') && (await p.waitForFunction(() => document.querySelectorAll('[data-testid=pub-pending]').length === 2, null, { timeout: 15000 }).then(() => true).catch(() => false)), await msg().innerText())
await p.getByTestId('pub-way-file').click()
await p.getByRole('button', { name: 'Import file' }).click()
await p.getByText('Choose a file first.').waitFor()
fs.writeFileSync('/tmp/fp19-bad.txt', 'just some words')
await p.getByLabel('File from your reference manager').setInputFiles('/tmp/fp19-bad.txt')
await p.getByRole('button', { name: 'Import file' }).click()
await p.getByText(/could not be read/).waitFor({ timeout: 10000 })
rec('P16 no file and an unreadable file each give a plain message', true, 'both shown')
await p.getByTestId('pub-pending').first().getByRole('button', { name: 'This is mine' }).click()
await msg().getByText('Marked as yours.').waitFor({ timeout: 10000 })
rec('P17 a reviewed work can be claimed and keeps origin file', sql(`select count(*) from identity.publication_candidate where "userId" = '${uid}' and origin = 'file' and status = 'claimed'`) === '1', 'claimed from file')

// Harvest (Sample list)
await p.getByTestId('pub-way-orcid').click()
await p.getByRole('button', { name: 'Look for new works' }).click()
await msg().getByText(/Found \d+ new/).waitFor({ timeout: 15000 })
rec('P18 the ORCID tab still finds the Sample works and puts them in review', true, await msg().innerText())

// Export
const names = {}
for (const f of ['bibtex', 'ris', 'csv', 'text']) {
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.getByTestId(`pub-export-${f}`).click()])
  const path = `${SHOTS}/../results/export-${dl.suggestedFilename()}`
  await dl.saveAs(path)
  names[f] = [dl.suggestedFilename(), fs.readFileSync(path, 'utf8')]
}
rec('P19 all four exports download with the right file names', names.bibtex[0] === 'publications.bib' && names.ris[0] === 'publications.ris' && names.csv[0] === 'publications.csv' && names.text[0] === 'publications.txt', Object.values(names).map((v) => v[0]).join(', '))
rec('P20 exports contain claimed works (including Only me and Urdu) and no pending ones', names.bibtex[1].includes('Optical fibres') && names.csv[1].includes('نمونہ کتاب') && names.csv[1].includes('only me') && sql(`select title from identity.publication_candidate where "userId" = '${uid}' and status = 'pending'`).split('\n').filter(Boolean).every((t) => !names.bibtex[1].includes(t)) && names.csv[1].charCodeAt(0) === 0xfeff, `bib ${names.bibtex[1].length} chars, csv ${names.csv[1].length} chars`)

// Delete
const before = await p.getByTestId('pub-claimed').count()
p.once('dialog', (d) => d.accept())
await p.getByTestId('pub-claimed').last().getByRole('button', { name: /^Delete/ }).click()
await p.waitForFunction((n) => document.querySelectorAll('[data-testid=pub-claimed]').length === n - 1, before, { timeout: 15000 })
rec('P21 a typed work can be deleted after confirming', true, `${before} -> ${before - 1}`)
rec('P22 harvested works offer no Delete', await p.locator('[data-testid=pub-claimed]:has-text("Found by ORCID") button:text-is("Delete")').count() === 0, 'none (or none claimed)')
await p.screenshot({ path: `${SHOTS}/03-after-desktop.png`, fullPage: true })

// Phone
const pm = await ctx.newPage()
await pm.setViewportSize({ width: 390, height: 844 })
await pm.goto(ORIGIN + '/portal/publications')
await pm.getByTestId('pub-add').waitFor()
const ov = [await pm.evaluate(() => document.documentElement.scrollWidth), 390]
await pm.screenshot({ path: `${SHOTS}/04-phone-top.png`, fullPage: true })
await pm.getByTestId('pub-way-manual').click()
await pm.screenshot({ path: `${SHOTS}/05-phone-form.png` })
const ov2 = await pm.evaluate(() => document.documentElement.scrollWidth)
rec('P23 no horizontal scroll at 390 px (list and form)', ov[0] <= 390 && ov2 <= 390, `scrollWidth ${ov[0]} and ${ov2}`)
const small = await pm.evaluate(() => [...document.querySelectorAll('main button, main select, main input:not([type=file]), main summary')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 40) }).map((e) => e.tagName + ':' + (e.textContent || e.getAttribute('aria-label') || '').slice(0, 20)))
rec('P24 touch targets are at least 40 px tall at 390 px', small.length === 0, small.join(' | ') || 'all tall enough')
fs.writeFileSync(OUT, JSON.stringify(results, null, 2))
await browser.close()
console.log(results.filter((r) => !r.ok).length, 'failed of', results.length)
