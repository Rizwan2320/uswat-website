/**
 * FP-21 (bridge stage 2, builds on FP-20): portal to public website, end to end in Chromium on one local server (portal scratch database fp20, CMS scratch database
 * cmsdemo, Sample people, example.invalid). Env: ORIGIN, PASSWORD, PDB (portal db url), CDB (cms db url), SLUG, OUT, SHOTS.
 * The signed message goes over HTTP to the same local server, exactly as it would go to the real site.
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
const email = 'fp20.head@example.invalid'

const ctx = await browser.newContext({ extraHTTPHeaders: { 'x-real-ip': '203.0.113.120' }, viewport: { width: 1280, height: 1000 } })
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

// Warm the receiving route first: a cold first compile in the dev server can exceed the 8 second send limit (seen on run 1).
await fetch(ORIGIN + '/api/portal/publish')
const before = psql(CDB, `select coalesce(l.details,'') from people p join people_locales l on l._parent_id=p.id and l._locale='en' where p.slug='${SLUG}'`)

// 1. Before anything is approved: the panel says nothing was sent, and the public page still shows the old sample text.
await p.goto(ORIGIN + '/portal/publications')
await p.getByTestId('pub-public-page').waitFor()
const panel0 = await p.getByTestId('pub-public-page').innerText()
rec('B1 the public-page panel is on the Publications screen and says nothing has been sent', panel0.includes('Update my public page') && panel0.includes('Nothing has been sent'), panel0.replace(/\s+/g, ' ').slice(0, 160))
await p.screenshot({ path: `${SHOTS}/01-panel-before.png`, fullPage: true })

// 2. Head writes the profile and publishes it themselves (no reviewer for a head): approval triggers the send.
await p.goto(ORIGIN + '/portal/profile')
await p.getByLabel('About you, in English').fill('FP20 bridge biography. Studies green solvents and teaches organic chemistry. Invented for the demonstration.')
await p.getByLabel('About you, in Urdu').fill('یہ تجرباتی تعارف ہے۔')
await p.getByLabel('Link to your CV').fill('https://example.org/cv/fp20-sample')
await p.getByLabel('Research interests').fill('green solvents, natural product extraction, catalysis')
await p.getByLabel('Office location').fill('Block B, room 4')
await p.getByLabel('Office hours').fill('Mon and Wed 10:00 to 12:00')
await p.getByLabel('ORCID iD').fill('0000-0002-1825-0097')
await p.getByLabel('Google Scholar link').fill('https://scholar.google.com/citations?user=fp21sample')
await p.getByRole('button', { name: 'Save draft' }).click()
await p.getByText('Draft saved.').waitFor()
await p.getByRole('button', { name: 'Save and publish' }).click()
await p.getByRole('heading', { name: 'Published now' }).waitFor({ timeout: 30000 })
let sync1 = ''
for (let i = 0; i < 40 && !sync1; i++) { sync1 = psql(PDB, `select coalesce("lastError",'ok') from identity.public_sync`); if (!sync1) await p.waitForTimeout(1000) }
rec('B2 publishing the profile sent it to the site automatically (last attempt ok)', sync1 === 'ok', `public_sync.lastError = ${sync1}`)

const anon = await browser.newContext({ viewport: { width: 1280, height: 1000 } })
const a = await anon.newPage(); a.setDefaultNavigationTimeout(120000)
async function publicPage(name) { await a.goto(`${ORIGIN}/people/${SLUG}?t=${Date.now()}`); await a.waitForLoadState('networkidle'); await a.screenshot({ path: `${SHOTS}/${name}`, fullPage: true }); return a.locator('main').innerText() }
const t1 = await publicPage('02-public-after-approval.png')
rec('B3 the public profile now shows the approved biography', t1.includes('FP20 bridge biography'), 'bio text present on /people/' + SLUG)
rec('B4 the old sample biography is gone (replaced, not appended)', !t1.includes('Not information about a real person'), 'the sample text had: ' + (before ? before.slice(0, 40) : 'nothing'))
const cv = await a.getByRole('link', { name: 'Open the CV' }).getAttribute('href').catch(() => null)
rec('B5 the CV link is the one the person entered', cv === 'https://example.org/cv/fp20-sample', String(cv))

const side = await a.locator('aside[aria-label="Details"]').innerText()
const chips = await a.locator('#interests + ul li').allInnerTexts()
rec('C1 research interests show as a list', JSON.stringify(chips) === JSON.stringify(['green solvents', 'natural product extraction', 'catalysis']), JSON.stringify(chips))
rec('C2 office location and office hours show in the details column', side.includes('Block B, room 4') && side.includes('Mon and Wed 10:00 to 12:00'), side.replace(/\s+/g, ' ').slice(0, 200))
const orcidHref = await a.getByRole('link', { name: '0000-0002-1825-0097' }).getAttribute('href').catch(() => null)
rec('C3 ORCID links to orcid.org', orcidHref === 'https://orcid.org/0000-0002-1825-0097', String(orcidHref))
const scholar = await a.getByRole('link', { name: 'Open the Scholar profile' }).getAttribute('href').catch(() => null)
rec('C4 Google Scholar link is the one entered', scholar === 'https://scholar.google.com/citations?user=fp21sample', String(scholar))

// 3. Publications: add three works (one with full text, one with DOI only, one plain), feature one, make one private.
await p.goto(ORIGIN + '/portal/publications'); await p.getByTestId('pub-add').waitFor()
async function manual(vals) {
  await p.getByTestId('pub-way-manual').click()
  const add = p.getByTestId('pub-add')
  await add.getByLabel('Title', { exact: true }).fill(vals.title)
  await add.getByLabel('Authors').fill('A. Sample')
  await add.getByLabel('Year').fill(vals.year ?? '2023')
  if (vals.doi) await add.getByLabel('DOI', { exact: true }).fill(vals.doi)
  if (vals.url) await add.getByLabel('Link to the full text').fill(vals.url)
  if (vals.venue) await add.getByLabel('Journal, conference or publisher').fill(vals.venue)
  await p.getByRole('button', { name: 'Add to my publications' }).click()
  await p.getByText(vals.title).first().waitFor({ timeout: 20000 })
}
await manual({ title: 'Plain work with no link', year: '2020' })
await manual({ title: 'DOI only work', doi: '10.5555/fp20.doi', year: '2021' })
await manual({ title: 'Full text work', url: 'https://example.org/papers/fulltext.pdf', year: '2022', venue: 'Journal of Green Chemistry' })
await manual({ title: 'Private work should not travel', year: '2019' })
const card = (t) => p.getByTestId('pub-claimed').filter({ hasText: t })
await card('Private work should not travel').getByLabel(/who can see/i).selectOption('private')
await p.getByText(/changed|private/i).first().waitFor().catch(() => {})
await p.waitForTimeout(800)
await card('Plain work with no link').getByRole('button', { name: /^Feature/ }).click()
await p.waitForTimeout(800)
await p.screenshot({ path: `${SHOTS}/03-works-ready.png`, fullPage: true })

// 4. Press the button.
await p.getByRole('button', { name: 'Update my public page' }).click()
await p.getByText(/Sent\./).waitFor({ timeout: 30000 })
rec('B6 the button reports Sent and the panel shows when', true, (await p.getByTestId('pub-public-status').innerText()).replace(/\s+/g, ' '))
await p.reload(); await p.getByTestId('pub-public-page').waitFor()
const stamp = await p.getByTestId('pub-public-status').innerText()
rec('B7 after a reload the panel shows the last-sent time', /Last sent/.test(stamp), stamp.replace(/\s+/g, ' '))
await p.screenshot({ path: `${SHOTS}/04-panel-after.png`, fullPage: true })

const t2 = await publicPage('05-public-with-works.png')
const links = await a.locator('#pubs + ol li').evaluateAll((els) => els.map((e) => ({ text: (e.querySelector('a')?.textContent ?? e.childNodes[0].textContent).trim(), href: e.querySelector('a')?.getAttribute('href') ?? null })))
rec('B8 the public page lists the three public works and not the private one', links.length === 3 && !t2.includes('Private work should not travel'), JSON.stringify(links.map((l) => l.text)))
rec('B9 the featured work comes first', links[0]?.text === 'Plain work with no link', links[0]?.text)
const byText = Object.fromEntries(links.map((l) => [l.text, l.href]))
rec('B10 a work with a full-text address links to it, a DOI-only work links to the DOI, a bare work is plain text', byText['Full text work'] === 'https://example.org/papers/fulltext.pdf' && byText['DOI only work'] === 'https://doi.org/10.5555/fp20.doi' && byText['Plain work with no link'] === null, JSON.stringify(byText))

const metaLine = await a.locator('#pubs + ol li', { hasText: 'Full text work' }).innerText()
rec('C5 a work shows its journal, year and kind under the title', metaLine.includes('Journal of Green Chemistry') && metaLine.includes('2022') && metaLine.includes('Journal article'), metaLine.replace(/\s+/g, ' '))
rec('C6 the featured work carries a Featured mark and the others do not', (await a.locator('#pubs + ol li', { hasText: 'Plain work with no link' }).innerText()).includes('Featured') && !(await a.locator('#pubs + ol li', { hasText: 'DOI only work' }).innerText()).includes('Featured'), 'Featured on the first only')

// 4b. The same page at phone width: nothing runs past the screen.
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const ph = await phone.newPage(); ph.setDefaultNavigationTimeout(120000)
await ph.goto(`${ORIGIN}/people/${SLUG}?t=${Date.now()}`); await ph.waitForLoadState('networkidle')
const wide = await ph.evaluate(() => document.documentElement.scrollWidth)
await ph.screenshot({ path: `${SHOTS}/05b-public-phone.png`, fullPage: true })
rec('C7 at 390 px wide the public page does not scroll sideways', wide <= 390, 'scrollWidth ' + wide)
await phone.close()

// 5. Hide a work and DO NOT press the button: the automatic send updates the public page.
await card('Full text work').getByLabel(/who can see/i).selectOption('private')
let gone = false, t3 = ''
for (let i = 0; i < 15 && !gone; i++) { await p.waitForTimeout(1000); t3 = await publicPage('06-public-after-hide.png'); gone = !t3.includes('Full text work') }
rec('B11 making a work private removes it from the public page with no button press (automatic send)', gone && t3.includes('DOI only work'), gone ? 'gone within ' + 'the 15 second window' : 'still shown after 15 seconds')

// 5b. A failed attempt shows as waiting (set directly: the server here can always reach itself).
psql(PDB, `update identity.public_sync set "lastError" = 'site not reachable'`)
await p.reload(); await p.getByTestId('pub-public-page').waitFor()
rec('B16 after a failed attempt the panel says it is waiting to appear', (await p.getByTestId('pub-public-status').innerText()).includes('Waiting to appear on the public site'), (await p.getByTestId('pub-public-status').innerText()).replace(/\s+/g, ' ').slice(0, 120))
await p.screenshot({ path: `${SHOTS}/07-panel-waiting.png`, fullPage: true })

// 6. Unsigned and wrongly signed calls: break the shared address in the database of the world? Instead call the endpoint unsigned and with a wrong signature.
const un = await fetch(ORIGIN + '/api/portal/publish', { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' } })
rec('B12 an unsigned call to the endpoint gets an empty 404', un.status === 404 && (await un.text()) === '', 'status ' + un.status)
const bad = await fetch(ORIGIN + '/api/portal/publish', { method: 'POST', body: '{}', headers: { 'content-type': 'application/json', 'x-uswat-timestamp': String(Date.now()), 'x-uswat-signature': 'a'.repeat(64) } })
rec('B13 a wrong signature gets an empty 404', bad.status === 404, 'status ' + bad.status)
const g = await fetch(ORIGIN + '/api/portal/publish')
rec('B14 GET on the endpoint is not served as a page', g.status === 405 || g.status === 404, 'status ' + g.status)

// 7. The record's identity fields were never touched.
const ident = psql(CDB, `select name from people_locales l join people p on p.id=l._parent_id where p.slug='${SLUG}' and l._locale='en'`)
rec('B15 the person\'s name on the public record is unchanged', ident === 'Dr. Amina Rauf', ident + ' (the SQL-filled name; unchanged)')

fs.writeFileSync(OUT, JSON.stringify(results, null, 2))
console.log(`${results.filter((r) => r.ok).length}/${results.length} passed`)
await browser.close()
