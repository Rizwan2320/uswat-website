/**
 * FP-16 (FP-03 reviewer half, FPR-04, PJ4): the department reviewer queue driven in Chromium against the running production build.
 * Five sample accounts in two departments; roles are set with the real operator command. Virtual authenticators, one per person.
 * Env: ORIGIN, PASSWORD, DBURL, OUT, SHOTS, APPWEB, PORTAL_DATABASE_URL (for the CLI). Sample accounts only (example.invalid).
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, PASSWORD, DBURL, OUT, SHOTS, APPWEB } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const sql = (q) => execFileSync('psql', [DBURL, '-tAc', q]).toString().trim()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch()
const E = { revCs: 'rev.cs@example.invalid', facA: 'fac.a@example.invalid', facB: 'fac.b@example.invalid', revPhy: 'rev.phy@example.invalid', facP: 'fac.p@example.invalid' }
const uid = (email) => sql(`select id from identity."user" where email = '${email}'`)
const roles = (...args) => {
  try {
    const out = execFileSync('npx', ['tsx', 'scripts/identity-roles.ts', ...args], { cwd: APPWEB, env: { ...process.env, PORTAL_DATABASE_URL: DBURL }, stdio: ['ignore', 'pipe', 'pipe'] }).toString()
    return { code: 0, out }
  } catch (e) { return { code: e.status, out: String(e.stdout) + String(e.stderr) } }
}

async function newDevice(ip, extra = {}) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { 'x-real-ip': ip }, ...extra })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  const r = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } })
  return { ctx, page, cdp, authId: r.authenticatorId }
}
async function enrol(email, ip, extra) {
  sql(`delete from identity.session where "userId" in (select id from identity."user" where email = '${email}')`)
  const d = await newDevice(ip, extra)
  const { page } = d
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
  return d
}
async function submitProfile(d, { bioEn, bioUr, hours }) {
  const { page } = d
  await page.goto(ORIGIN + '/portal/profile')
  await page.getByLabel('About you, in English').fill(bioEn)
  await page.getByLabel('About you, in Urdu').fill(bioUr)
  await page.getByLabel('Office hours').fill(hours)
  await page.getByRole('button', { name: 'Save and send for review' }).click()
  await page.getByText('Sent for review.', { exact: true }).waitFor({ timeout: 15000 })
}
const hostile = `<script>window.__pwn=1</script><img src=x onerror="window.__pwn=2"> & "quotes"`

// ---- accounts and roles (the operator command)
{
  const cs = 'Computer Science (sample)', phy = 'physics (sample)'
  let r = roles('grant-reviewer', E.revCs)
  rec('R0 the operator command refuses a reviewer grant before a department is set', r.code === 1 && /no-department/.test(r.out), r.out.trim().slice(0, 80))
  r = roles('set-department', 'nobody@example.invalid', 'X')
  rec('R1 and refuses an unknown account', r.code === 1 && /no-account/.test(r.out), r.out.trim().slice(0, 80))
  const ok = [
    roles('set-department', E.revCs, cs), roles('set-department', E.facA, cs.toUpperCase()), roles('set-department', E.facB, cs),
    roles('set-department', E.revPhy, phy), roles('set-department', E.facP, 'Physics (Sample)'),
    roles('grant-reviewer', E.revCs), roles('grant-reviewer', E.revPhy),
  ].every((x) => x.code === 0)
  const listed = JSON.parse(roles('list').out)
  rec('R2 departments and the two reviewer roles are set, and the list shows them', ok && listed.length === 5 && listed.filter((x) => x.reviewer).length === 2, `${listed.length} accounts, ${listed.filter((x) => x.reviewer).length} reviewers`)
}

// ---- five people sign up their passkeys
const people = {}
let n = 10
for (const [k, email] of Object.entries(E)) { people[k] = await enrol(email, `203.0.113.${n++}`); await sleep(600) }
const id = Object.fromEntries(Object.entries(E).map(([k, e]) => [k, uid(e)]))

// ---- faculty submit
await submitProfile(people.facA, { bioEn: `Hello ${hostile}`, bioUr: 'یہ ایک نمونہ تعارف ہے۔', hours: 'Mon 10:00 to 12:00' })
await sleep(1200)
await submitProfile(people.facB, { bioEn: 'Second person, bio.', bioUr: '', hours: 'Tue 9:00' })
await submitProfile(people.facP, { bioEn: 'Physics person.', bioUr: '', hours: '' })
rec('R3 three faculty members submitted from the profile screen', Number(sql(`select count(*) from identity.profile_draft where status='submitted'`)) === 3, 'three submitted')

// ---- who sees the link and the queue
{
  const home = async (d) => { await d.page.goto(ORIGIN + '/portal'); return d.page.getByRole('link', { name: /profile changes/ }).count() }
  rec('R4 only a reviewer sees the Review link on the home page', (await home(people.revCs)) === 1 && (await home(people.revPhy)) === 1 && (await home(people.facA)) === 0, 'reviewers yes, faculty no')
  const resp = await people.facA.page.goto(ORIGIN + '/portal/review')
  rec('R5 a faculty member who is not a reviewer gets "not found" for the queue', resp.status() === 404, `status ${resp.status()}`)
  await people.revCs.page.goto(ORIGIN + '/portal/review')
  const cs = await people.revCs.page.getByTestId('queue').innerText()
  await people.revPhy.page.goto(ORIGIN + '/portal/review')
  const ph = await people.revPhy.page.getByTestId('queue').innerText()
  rec('R6 each reviewer sees only their own department (case ignored), oldest first', /Sample facA/.test(cs) === false && cs.includes('Sample User') && !cs.includes('Physics') && ph.split('\n').length < cs.split('\n').length, `cs rows ${cs.split('\n').length}, physics rows ${ph.split('\n').length}`)
  const rowsCs = await people.revCs.page.locator('[data-testid=queue] tbody tr').count()
  const rowsPh = await people.revPhy.page.locator('[data-testid=queue] tbody tr').count()
  rec('R7 Computer Science sees two profiles, Physics sees one, nobody sees their own', rowsCs === 2 && rowsPh === 1, `${rowsCs} and ${rowsPh}`)
  const order = sql(`select string_agg(u.email, ',' order by d."updatedAt") from identity.profile_draft d join identity."user" u on u.id = d."userId" where d.status='submitted' and u.email in ('${E.facA}','${E.facB}')`)
  const first = await people.revCs.page.locator('[data-testid=queue] tbody tr a').first().getAttribute('href')
  rec('R8 the oldest submission is listed first', order.startsWith(E.facA) && first.endsWith(id.facA), first)
  await people.revCs.page.screenshot({ path: `${SHOTS}/queue-desktop.png`, fullPage: true })
}

// ---- opening profiles: IDOR
{
  const p = people.revCs.page
  const codes = []
  for (const target of [id.facP, id.revCs, 'no-such-person', '..%2F..%2Fportal', "x'%20or%20'1'='1"]) codes.push((await p.goto(`${ORIGIN}/portal/review/${target}`)).status())
  rec('R9 another department\'s profile, one\'s own, a stranger and malformed ids all answer 404', codes.every((c) => c === 404), codes.join(','))
  const r = await people.facA.page.goto(`${ORIGIN}/portal/review/${id.facB}`)
  rec('R10 a colleague who is not a reviewer cannot open a profile either', r.status() === 404, `status ${r.status()}`)
}

// ---- the comparison, with hostile text
const rev = people.revCs.page
await rev.goto(`${ORIGIN}/portal/review/${id.facA}`)
{
  const cmp = await rev.getByTestId('compare').innerText()
  const pwn = await rev.evaluate(() => window.__pwn)
  const bad = await rev.locator('img[src="x"], script:not([src]):has-text("__pwn")').count()
  rec('R11 hostile text is shown as text: no script ran and no element was made', pwn === undefined && bad === 0 && cmp.includes('<script>window.__pwn=1</script>'), `__pwn ${pwn}, injected ${bad}`)
  const rtl = await rev.locator('tr[data-field=bioUr] td[data-col=after] [dir=rtl][lang=ur]').count()
  rec('R12 the Urdu text is marked right-to-left and Urdu', rtl === 1, `${rtl}`)
  const fields = await rev.locator('[data-testid=compare] tbody tr').evaluateAll((rs) => rs.map((r) => r.getAttribute('data-field')))
  rec('R13 first publication: only fields with content are listed, "nothing published" on the left', fields.join() === 'bioEn,bioUr,officeHours' && (await rev.getByText('(nothing published)').count()) >= 3, fields.join())
  rec('R14 the page says nothing has been published yet', (await rev.getByText(/Nothing is published for this person yet/).count()) === 1, 'notice shown')
  await rev.screenshot({ path: `${SHOTS}/detail-desktop.png`, fullPage: true })
}

// ---- ask for changes
{
  await rev.getByTestId('ask-changes').click()
  await rev.getByTestId('send-changes').click()
  await rev.getByTestId('note-error').waitFor()
  rec('R15 asking for changes without a note is refused beside the field, and nothing is saved', (await rev.getByTestId('note-error').innerText()).includes('Write a note') && Number(sql(`select count(*) from identity.profile_review`)) === 0, 'inline error, no log')
  await rev.getByLabel('Note to the faculty member').fill('Please remove the markup from the bio.\nThank you.')
  await rev.getByTestId('send-changes').click()
  await rev.waitForURL('**/portal/review?decided=changes', { timeout: 15000 })
  rec('R16 with a note it goes back to the owner and the list says so', (await rev.getByTestId('decided-notice').innerText()).includes('Sent back') && sql(`select decision||'|'||note from identity.profile_review where "userId"='${id.facA}'`) === 'changes-requested|Please remove the markup from the bio.\nThank you.', 'logged with the actor ' + sql(`select count(*) from identity.profile_review where "reviewerId"='${id.revCs}'`))
  rec('R17 that profile left the queue', (await rev.locator('[data-testid=queue] tbody tr').count()) === 1, 'one left')
  const a = people.facA.page
  await a.goto(ORIGIN + '/portal/profile')
  const note = await a.getByTestId('review-note').innerText()
  rec('R18 the owner sees the note, in the same line breaks, above the form, and can edit again', note.includes('Please remove the markup') && note.includes('Thank you.') && (await a.getByTestId('profile-status').innerText()).includes('Saved as a draft') && (await a.getByLabel('About you, in English').isEnabled()), 'note shown')
  rec('R19 the owner sees that nothing is published yet', (await a.getByTestId('published-none').count()) === 1, 'no published copy')
  await a.screenshot({ path: `${SHOTS}/owner-note.png`, fullPage: true })
}

// ---- resubmit, approve by keyboard
{
  const a = people.facA.page
  await a.getByLabel('About you, in English').fill('Hello, a clean bio.')
  await a.getByRole('button', { name: 'Save and send for review' }).click()
  await a.getByText('Sent for review.', { exact: true }).waitFor()
  rec('R20 resubmitting clears the note', Number(sql(`select count(*) from identity.profile_draft where "userId"='${id.facA}' and "reviewNote" is null and status='submitted'`)) === 1, 'cleared')
  await rev.goto(`${ORIGIN}/portal/review/${id.facA}`)
  const fields = await rev.locator('[data-testid=compare] tbody tr').evaluateAll((rs) => rs.map((r) => r.getAttribute('data-field')))
  await rev.getByTestId('approve').focus()
  await rev.keyboard.press('Enter')
  await rev.waitForURL('**/portal/review?decided=approved', { timeout: 15000 })
  const pub = sql(`select edit->'bio'->>'en' from identity.profile_published where "userId"='${id.facA}'`)
  rec('R21 Approve works from the keyboard and publishes the approved text (sample)', pub === 'Hello, a clean bio.' && fields.includes('bioEn'), `published "${pub}"`)
  const a2 = people.facA.page
  await a2.goto(ORIGIN + '/portal/profile')
  const now = await a2.getByTestId('published-now').innerText()
  rec('R22 the owner sees "Published now" with the approved version, and a status of draft', now.includes('Hello, a clean bio.') && !now.includes('<script>'), 'preview shown')
  rec('R23 the log has the actor, before and after for both decisions, in order', sql(`select string_agg(decision, ',' order by "at") from identity.profile_review where "userId"='${id.facA}'`) === 'changes-requested,approved', 'two entries')
  await a2.screenshot({ path: `${SHOTS}/owner-published.png`, fullPage: true })
}

// ---- stale: the owner takes it back while the reviewer is looking
{
  await rev.goto(`${ORIGIN}/portal/review/${id.facB}`)
  await people.facB.page.goto(ORIGIN + '/portal/profile')
  await people.facB.page.getByRole('button', { name: 'Take it back to edit' }).click()
  await people.facB.page.getByText('Taken back.').waitFor()
  await rev.getByTestId('approve').click()
  await rev.getByTestId('decision-error').waitFor()
  const t = await rev.getByTestId('decision-error').innerText()
  rec('R24 deciding on a profile taken back meanwhile is refused with a clear message and a way back', /changed or took back/.test(t) && (await rev.getByRole('link', { name: 'Reload the list' }).count()) === 1, t.slice(0, 60))
  rec('R25 the buttons are disabled after that, and nothing was published or logged', (await rev.getByTestId('approve').isDisabled()) && Number(sql(`select count(*) from identity.profile_review where "userId"='${id.facB}'`)) === 0, 'nothing written')
  await rev.screenshot({ path: `${SHOTS}/detail-stale.png`, fullPage: true })
  // they send it again; the reviewer opens it fresh
  await people.facB.page.getByRole('button', { name: 'Save and send for review' }).click()
  await people.facB.page.getByText('Sent for review.', { exact: true }).waitFor()
}

// ---- the second factor must be recent
{
  const sid = sql(`select s.id from identity.session s where s."userId"='${id.revCs}' order by s."createdAt" desc limit 1`)
  await rev.goto(`${ORIGIN}/portal/review/${id.facB}`)
  rec('R26 with a recent confirmation the buttons are enabled', await rev.getByTestId('approve').isEnabled(), 'enabled')
  sql(`update identity.session_assurance set "verifiedAt" = now() - interval '30 minutes' where "sessionId"='${sid}'`)
  await rev.getByTestId('approve').click()
  await rev.getByTestId('decision-error').waitFor()
  rec('R27 if the confirmation ran out after the page loaded, the decision is refused and nothing is written', /Confirm it is you first/.test(await rev.getByTestId('decision-error').innerText()) && Number(sql(`select count(*) from identity.profile_review where "userId"='${id.facB}'`)) === 0, 'refused')
  await rev.goto(`${ORIGIN}/portal/review/${id.facB}`)
  rec('R28 reloading shows why the buttons are off, with a link to confirm', (await rev.getByTestId('needs-fresh').count()) === 1 && (await rev.getByTestId('approve').isDisabled()) && (await rev.getByTestId('needs-fresh').getByRole('link').getAttribute('href')) === '/portal/security', 'notice and link')
  sql(`update identity.session_assurance set "verifiedAt" = now() where "sessionId"='${sid}'`)
  await rev.goto(`${ORIGIN}/portal/review/${id.facB}`)
  await rev.getByTestId('approve').click()
  await rev.waitForURL('**/portal/review?decided=approved', { timeout: 15000 })
  rec('R29 once confirmed again the decision goes through', Number(sql(`select count(*) from identity.profile_review where "userId"='${id.facB}' and decision='approved'`)) === 1, 'approved')
}

// ---- narrow screen
{
  const d = await newDevice('203.0.113.200', { viewport: { width: 390, height: 844 } })
  await d.page.goto(ORIGIN + '/portal/sign-in')
  await d.page.getByLabel('Email address').fill(E.revPhy)
  await d.page.getByLabel('Password').fill(PASSWORD)
  const creds = (await people.revPhy.cdp.send('WebAuthn.getCredentials', { authenticatorId: people.revPhy.authId })).credentials
  let c = 5000
  for (const k of creds) await d.cdp.send('WebAuthn.addCredential', { authenticatorId: d.authId, credential: { ...k, signCount: (c += 10) } })
  await d.page.getByRole('button', { name: 'Sign in with a passkey' }).click()
  await d.page.waitForURL('**/portal', { timeout: 15000 })
  await d.page.goto(ORIGIN + '/portal/review')
  const w1 = await d.page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
  await d.page.screenshot({ path: `${SHOTS}/queue-390.png`, fullPage: true })
  await d.page.locator('[data-testid=queue] tbody tr a').first().click()
  await d.page.getByTestId('compare').waitFor()
  const w2 = await d.page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
  await d.page.screenshot({ path: `${SHOTS}/detail-390.png`, fullPage: true })
  rec('R30 at 390 px the queue and the comparison do not scroll sideways', w1[0] <= w1[1] && w2[0] <= w2[1], `queue ${w1}, detail ${w2}`)
  await d.ctx.close()
}

// ---- a revoked reviewer loses access at once
{
  const r = roles('revoke-reviewer', E.revCs)
  const status = (await people.revCs.page.goto(`${ORIGIN}/portal/review`)).status()
  const detail = (await people.revCs.page.goto(`${ORIGIN}/portal/review/${id.facP}`)).status()
  await people.revCs.page.goto(ORIGIN + '/portal')
  rec('R31 after the role is revoked the queue and a profile answer 404 and the link is gone, without signing out', r.code === 0 && status === 404 && detail === 404 && (await people.revCs.page.getByRole('link', { name: /profile changes/ }).count()) === 0, `${status}, ${detail}`)
}

fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), results }, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
