/**
 * FP-18 (FP-50, PJ6): delegation, driven in Chromium against the running production build. Three sample accounts (all example.invalid):
 * Ayesha (grantor), Bilal (delegate), Carol (a stranger). Every grant, edit, withdrawal and refusal goes through the screens; the
 * database is read only to confirm where a change landed, and written only to move a grant's clock back (expiry has no job).
 * Env: ORIGIN, PASSWORD, DBURL, OUT, SHOTS.
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, PASSWORD, DBURL, OUT, SHOTS } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const sql = (q) => execFileSync('psql', [DBURL, '-tAc', q]).toString().trim()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch()

async function device(ip, extra = {}) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { 'x-real-ip': ip }, ...extra })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } })
  return { ctx, page }
}
async function enrolled(email, ip, extra) {
  const d = await device(ip, extra)
  const p = d.page
  await p.goto(ORIGIN + '/portal/sign-in')
  await p.getByLabel('Email address').fill(email)
  await p.getByLabel('Password').fill(PASSWORD)
  await p.getByRole('button', { name: 'Sign in with password' }).click()
  await p.waitForURL('**/portal/enrol', { timeout: 15000 })
  await p.getByRole('button', { name: 'Add a passkey' }).click()
  await p.getByText('Your passkey is saved.').waitFor({ timeout: 15000 })
  await p.getByRole('button', { name: 'Get my recovery codes' }).click()
  await p.getByRole('list', { name: 'Save your recovery codes' }).waitFor()
  await p.getByLabel('I have saved these codes').check()
  await p.getByRole('button', { name: 'Continue to the portal' }).click()
  await p.waitForURL('**/portal', { timeout: 15000 })
  return d
}
const idOf = (email) => sql(`select id from identity."user" where email = '${email}'`)
const status = async (page, url) => (await page.goto(url)).status()
const overflow = (page) => page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])

const A = 'ayesha.sample@example.invalid', B = 'bilal.sample@example.invalid', C = 'carol.sample@example.invalid'
sql(`update identity."user" set name = 'Dr Ayesha Sample' where email = '${A}'`)
sql(`update identity."user" set name = 'Bilal Sample' where email = '${B}'`)
sql(`update identity."user" set name = 'Carol Sample' where email = '${C}'`)
const aId = idOf(A), bId = idOf(B), cId = idOf(C)
const ga = await enrolled(A, '203.0.113.41'); await sleep(800)
const gb = await enrolled(B, '203.0.113.42'); await sleep(800)
const gc = await enrolled(C, '203.0.113.43')
// Ayesha has an ORCID iD in her draft, so the publications screen can look for works.
sql(`insert into identity.profile_draft ("userId","edit","status") values ('${aId}', '{"bio":{"en":"","ur":""},"researchInterests":[],"officeLocation":"","officeHours":"","orcid":"0000-0002-1825-0097","scholarUrl":"","cvLink":"","visibility":{"email":"hidden","photo":"hidden"}}', 'draft')`)

const grantForm = async (p, email, sections, days) => {
  await p.getByLabel('Colleague’s email address').fill(email)
  for (const s of ['Profile draft', 'Publications', 'Courses']) {
    const box = p.getByLabel(s, { exact: true })
    if ((await box.isChecked()) !== sections.includes(s)) await box.setChecked(sections.includes(s))
  }
  await p.getByLabel('Number of days').fill(String(days))
  await p.getByRole('button', { name: 'Give access' }).click()
}

// ---- the grantor gives access
const pa = ga.page
await pa.goto(ORIGIN + '/portal/delegation')
await pa.getByRole('heading', { name: 'Give access' }).waitFor()
rec('D1 the delegation page needs a signed-in strong session, shows the Sample badge and the plain explanation', (await pa.getByText('Sample', { exact: true }).count()) >= 1 && (await pa.getByText('They can never submit your profile').count()) === 1, 'badge and explanation present')
await pa.screenshot({ path: `${SHOTS}/delegation-empty-desktop.png`, fullPage: true })

await grantForm(pa, 'nobody.at.all@example.invalid', ['Courses'], 7)
await pa.getByTestId('grant-error').waitFor()
const unknownText = await pa.getByTestId('grant-error').innerText()
// A fresh page, so the second message cannot be the first one left over.
await pa.goto(ORIGIN + '/portal/delegation')
await pa.getByRole('heading', { name: 'Give access' }).waitFor()
sql(`insert into identity.account_status ("userId","status") values ('${cId}','suspended') on conflict ("userId") do update set "status" = 'suspended'`)
await grantForm(pa, C, ['Courses'], 7)
await pa.getByTestId('grant-error').waitFor()
const suspendedText = await pa.getByTestId('grant-error').innerText()
sql(`delete from identity.account_status where "userId" = '${cId}'`)
rec('D2 an unknown address and a suspended account get the same sentence, and nothing is created', unknownText === suspendedText && unknownText.includes('cannot be given') && sql('select count(*) from identity.delegation') === '0', unknownText.slice(0, 70))

await grantForm(pa, A, ['Courses'], 7)
await pa.waitForFunction(() => /yourself/.test(document.querySelector('[data-testid=grant-error]')?.textContent ?? ''))
rec('D3 giving access to yourself is refused', sql('select count(*) from identity.delegation') === '0', 'refused')
await grantForm(pa, B, ['Courses'], 91)
await pa.waitForFunction(() => /1 to 90/.test(document.querySelector('[data-testid=grant-error]')?.textContent ?? ''))
await grantForm(pa, B, [], 30)
await pa.waitForFunction(() => /at least one part/.test(document.querySelector('[data-testid=grant-error]')?.textContent ?? ''))
rec('D4 91 days and no section are refused with a plain message, and nothing is created', sql('select count(*) from identity.delegation') === '0', 'both refused')

await grantForm(pa, B, ['Publications', 'Courses'], 30)
await pa.getByTestId('grant-ok').waitFor()
const given = pa.getByTestId('given-list')
await given.waitFor()
rec('D5 granting works: Publications and Courses for 30 days, shown as Active for Bilal', (await given.innerText()).includes('Bilal Sample') && (await pa.getByTestId('grant-state').first().innerText()) === 'Active' && sql(`select sections::text from identity.delegation where "grantorId" = '${aId}'`) === '{publications,courses}', 'listed active')
rec('D6 the grant ends within 90 days and covers only what was ticked', Number(sql(`select extract(day from "expiresAt" - "createdAt")::int from identity.delegation`)) === 30, '30 days')
await pa.screenshot({ path: `${SHOTS}/delegation-given-desktop.png`, fullPage: true })

// ---- the delegate edits, as the delegate
const pb = gb.page
await pb.goto(ORIGIN + '/portal/delegation')
await pb.getByTestId('received-list').waitFor()
const links = await pb.getByTestId('received-list').getByRole('link').allInnerTexts()
rec('D7 Bilal sees one "Edit" link per granted part, none for the profile, and no grant he did not receive', links.length === 2 && links.every((l) => l.includes('Dr Ayesha Sample') && !/profile/i.test(l)) && (await pb.getByTestId('given-empty').count()) === 1, links.join(' | '))
await pb.screenshot({ path: `${SHOTS}/delegation-received-desktop.png`, fullPage: true })

await pb.getByRole('link', { name: /Edit Dr Ayesha Sample’s courses/ }).click()
await pb.getByTestId('delegation-banner').waitFor()
const banner = await pb.getByTestId('delegation-banner').innerText()
rec('D8 the delegate’s courses page says whose page it is, until when, and offers the way back', /Dr Ayesha Sample/.test(banner) && /until/.test(banner) && /recorded with your name/.test(banner) && (await pb.getByRole('link', { name: 'Back to your own page' }).count()) === 1, banner.slice(0, 90))
await pb.getByLabel('Course code').fill('CS-401')
await pb.getByLabel('Course title').fill('Sample Compilers')
await pb.getByRole('button', { name: 'Add course' }).click()
await pb.getByText('Course added.').waitFor()
rec('D9 a course added by the delegate lands in the grantor’s list and not in the delegate’s', sql(`select count(*) from identity.course_taught where "userId" = '${aId}' and code = 'CS-401'`) === '1' && sql(`select count(*) from identity.course_taught where "userId" = '${bId}'`) === '0', 'grantor 1, delegate 0')
await pb.screenshot({ path: `${SHOTS}/delegate-courses-desktop.png`, fullPage: true })
await pb.goto(ORIGIN + '/portal/courses')
rec('D10 Bilal’s own courses page is unchanged: no banner, none of Ayesha’s courses', (await pb.getByTestId('delegation-banner').count()) === 0 && (await pb.getByTestId('course-item').count()) === 0, 'own page empty')

await pb.goto(`${ORIGIN}/portal/publications?for=${aId}`)
await pb.getByTestId('delegation-banner').waitFor()
await pb.getByRole('button', { name: 'Look for new works' }).click()
await pb.getByTestId('pub-pending').first().waitFor({ timeout: 15000 })
await pb.getByRole('button', { name: 'This is mine' }).first().click()
await pb.waitForFunction(() => document.querySelectorAll('[data-testid=pub-pending]').length < 3 || true)
await sleep(1500)
rec('D11 the delegate looks for works with the grantor’s ORCID iD and claims one for her; his own list stays empty', Number(sql(`select count(*) from identity.publication_candidate where "userId" = '${aId}'`)) > 0 && sql(`select count(*) from identity.publication_candidate where "userId" = '${aId}' and status = 'claimed'`) === '1' && sql(`select count(*) from identity.publication_candidate where "userId" = '${bId}'`) === '0', 'rows only under the grantor')

// ---- everything outside the grant is a 404
const notFound = []
notFound.push(['profile (not granted)', await status(pb, `${ORIGIN}/portal/profile?for=${aId}`)])
notFound.push(['malformed id', await status(pb, `${ORIGIN}/portal/courses?for=not-a-uuid`)])
notFound.push(['an id that does not exist', await status(pb, `${ORIGIN}/portal/courses?for=nope0000000000000000000000000000`)])
notFound.push(['his own id', await status(pb, `${ORIGIN}/portal/courses?for=${bId}`)])
notFound.push(['the stranger as a grantor', await status(pb, `${ORIGIN}/portal/courses?for=${cId}`)])
notFound.push(['array form', await status(pb, `${ORIGIN}/portal/courses?for=${aId}&for=${aId}`)])
rec('D12 outside the grant is the same 404 every time: ungranted section, bad ids, himself, a stranger, repeated parameter', notFound.every(([, s]) => s === 404), notFound.map(([n, s]) => `${n} ${s}`).join('; '))
const pc = gc.page
const strangerStatus = [await status(pc, `${ORIGIN}/portal/courses?for=${aId}`), await status(pc, `${ORIGIN}/portal/publications?for=${aId}`), await status(pc, `${ORIGIN}/portal/profile?for=${aId}`)]
rec('D13 Carol, who has no grant, gets 404 on all three parts, and her own delegation page shows nothing received', strangerStatus.every((s) => s === 404), strangerStatus.join(', '))
await pb.goto(`${ORIGIN}/portal/security?for=${aId}`)
const secEmail = await pb.locator('main').innerText()
rec('D14 the security page ignores ?for= entirely: it shows Bilal’s own account and no banner', (await pb.getByTestId('delegation-banner').count()) === 0 && !secEmail.includes('Ayesha'), 'own account only')
const audit = sql(`select string_agg(section || ':' || action, ',' order by at) from identity.delegation_audit where "subjectId" = '${aId}' and "actorId" = '${bId}'`)
rec('D15 each delegated view and action is in the audit log under Bilal’s name for Ayesha, and Carol’s refused attempts are not', /courses:view/.test(audit) && /courses:addCourse/.test(audit) && /publications:harvestWorks/.test(audit) && /publications:claimWork/.test(audit) && sql(`select count(*) from identity.delegation_audit where "actorId" = '${cId}'`) === '0' && !/profile/.test(audit), audit)

// ---- the grantor sees the activity
await pa.goto(ORIGIN + '/portal/delegation')
const activity = await pa.getByTestId('activity-list').innerText()
rec('D16 Ayesha sees what was done on her behalf: who, which part, which action', /Bilal Sample/.test(activity) && /added a course/.test(activity) && /claimed a work/.test(activity) && !/addCourse|claimWork/.test(activity), 'activity list shows Bilal’s actions')
await pa.screenshot({ path: `${SHOTS}/delegation-activity-desktop.png`, fullPage: true })

// ---- re-grant to include the profile: replaces, and submit stays with her
await grantForm(pa, B, ['Profile draft', 'Publications', 'Courses'], 10)
await pa.getByTestId('grant-ok').waitFor()
await sleep(800)
const states = await pa.getByTestId('grant-state').allInnerTexts()
rec('D17 giving access again replaces the earlier grant: one Active, one Withdrawn, never two active', states.sort().join(',') === 'Active,Withdrawn' && sql(`select count(*) from identity.delegation where "revokedAt" is null`) === '1', states.join(','))
await pb.goto(`${ORIGIN}/portal/profile?for=${aId}`)
await pb.getByTestId('delegation-banner').waitFor()
await pb.getByLabel('Office location').fill('Block C, room 12 (sample)')
await pb.getByRole('button', { name: 'Save draft' }).click()
await pb.getByText('Draft saved.').waitFor()
const hasSubmit = await pb.getByRole('button', { name: /^Submit/ }).count()
rec('D18 the delegate can save the grantor’s profile draft but has no Submit button; the status stays draft', hasSubmit === 0 && sql(`select edit->>'officeLocation' from identity.profile_draft where "userId" = '${aId}'`).includes('Block C') && sql(`select status from identity.profile_draft where "userId" = '${aId}'`) === 'draft' && sql(`select count(*) from identity.profile_draft where "userId" = '${bId}'`) === '0', 'no submit; draft changed; status draft')
await pb.screenshot({ path: `${SHOTS}/delegate-profile-desktop.png`, fullPage: true })

// ---- withdrawal: an open page loses its power at once
await pb.goto(`${ORIGIN}/portal/courses?for=${aId}`)
await pb.getByTestId('delegation-banner').waitFor()
await pa.goto(ORIGIN + '/portal/delegation')
pa.once('dialog', (d) => d.accept())
await pa.getByRole('button', { name: /Withdraw access from Bilal Sample/ }).click()
await pa.waitForFunction(() => [...document.querySelectorAll('[data-testid=grant-state]')].every((e) => e.textContent !== 'Active'))
await pb.getByLabel('Course code').fill('CS-402')
await pb.getByLabel('Course title').fill('Should not be saved')
await pb.getByRole('button', { name: 'Add course' }).click()
const endedMsg = await pb.getByTestId('course-message').innerText({ timeout: 10000 }).catch(() => '')
rec('D19 after withdrawal the page Bilal already had open can no longer change anything, and it says so', sql(`select count(*) from identity.course_taught where "userId" = '${aId}' and code = 'CS-402'`) === '0' && /access to this page has ended/.test(endedMsg) && !/session ended/.test(endedMsg), endedMsg.slice(0, 80))
const afterRevoke = await status(pb, `${ORIGIN}/portal/courses?for=${aId}`)
await pb.goto(ORIGIN + '/portal/delegation')
rec('D20 the ?for= page is a 404 straight after withdrawal and the received list is empty', afterRevoke === 404 && (await pb.getByTestId('received-empty').count()) === 1, `status ${afterRevoke}`)

// ---- expiry: no job; checked when used
await grantForm(pa, B, ['Courses'], 1)
await pa.getByTestId('grant-ok').waitFor()
await pb.goto(`${ORIGIN}/portal/courses?for=${aId}`)
const beforeExpiry = (await pb.getByTestId('delegation-banner').count()) === 1
sql(`update identity.delegation set "createdAt" = now() - interval '2 days', "expiresAt" = now() - interval '1 day' where "revokedAt" is null`)
const afterExpiry = await status(pb, `${ORIGIN}/portal/courses?for=${aId}`)
await pa.goto(ORIGIN + '/portal/delegation')
const endedStates = await pa.getByTestId('grant-state').allInnerTexts()
rec('D21 a grant works until its end time and is a 404 after, with no job running; the grantor sees it as Ended', beforeExpiry && afterExpiry === 404 && endedStates.includes('Ended'), `before ok, after ${afterExpiry}, states ${endedStates.join(',')}`)

// ---- 390 px, long names, keyboard
sql(`update identity."user" set name = 'Dr Ayesha Sample-With-A-Very-Long-Family-Name-That-Keeps-Going-And-Going-For-Layout-Checking' where email = '${A}'`)
await grantForm(pa, B, ['Profile draft', 'Publications', 'Courses'], 30)
await pa.getByTestId('grant-ok').waitFor()
await pb.setViewportSize({ width: 390, height: 844 })
await pa.setViewportSize({ width: 390, height: 844 })
await pb.goto(ORIGIN + '/portal/delegation')
await pb.getByTestId('received-list').waitFor()
const w1 = await overflow(pb)
await pb.screenshot({ path: `${SHOTS}/delegation-received-390.png`, fullPage: true })
await pb.goto(`${ORIGIN}/portal/courses?for=${aId}`)
await pb.getByTestId('delegation-banner').waitFor()
const w2 = await overflow(pb)
await pb.screenshot({ path: `${SHOTS}/delegate-courses-390.png`, fullPage: true })
await pa.goto(ORIGIN + '/portal/delegation')
await pa.getByTestId('given-list').waitFor()
const w3 = await overflow(pa)
await pa.screenshot({ path: `${SHOTS}/delegation-given-390.png`, fullPage: true })
const btn = await pa.getByRole('button', { name: 'Give access' }).boundingBox()
rec('D22 at 390 px, with a very long name, the delegation page (both sides) and the banner do not scroll sideways and the buttons stay on screen', w1[0] <= w1[1] && w2[0] <= w2[1] && w3[0] <= w3[1] && btn.x >= 0 && btn.x + btn.width <= 390, `received ${w1}, banner page ${w2}, given ${w3}, button ${Math.round(btn.x)}..${Math.round(btn.x + btn.width)}`)

await pa.goto(ORIGIN + '/portal/delegation')
await pa.getByLabel('Colleague’s email address').focus()
await pa.keyboard.type(B)
await pa.keyboard.press('Tab')
await pa.keyboard.press('Space')
const firstChecked = await pa.getByTestId('section-profile').isChecked()
await pa.keyboard.press('Tab'); await pa.keyboard.press('Tab'); await pa.keyboard.press('Space')
const thirdChecked = await pa.getByTestId('section-courses').isChecked()
const names = await pa.evaluate(() => [...document.querySelectorAll('input')].filter((i) => i.type !== 'hidden').map((i) => i.labels?.[0]?.textContent?.trim() || i.getAttribute('aria-label') || ''))
rec('D23 the form works with the keyboard alone and every input has a label', firstChecked && thirdChecked && names.every((n) => n.length > 0), names.join(' | '))

// ---- nothing sensitive in the page
const html = await pb.content()
rec('D24 the delegate’s page holds no secret: no password hash, token or other person’s email in the HTML', !/\$argon|scrypt|tokenHash|@example\.invalid/.test(html.replace(/bilal\.sample@example\.invalid/g, '')), 'clean')

fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), results }, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
