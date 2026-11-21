/**
 * FP-43 (ABU-03): notification digest, written to a log. Chromium against the running production build. Three Sample accounts
 * (example.invalid): Ayesha (faculty, same department as Bilal), Bilal (reviewer and delegate), Carol (a stranger). No email is
 * sent anywhere; the notice log is what would be sent. The digest command is run for real. The database is read to confirm
 * results; roles are set by the operator command, as in production.
 * Env: ORIGIN, PASSWORD, DBURL, OUT, SHOTS, APPDIR.
 */
import { createRequire } from 'node:module'
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const { ORIGIN, PASSWORD, DBURL, OUT, SHOTS, APPDIR } = process.env
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`) }
const sql = (q) => execFileSync('psql', [DBURL, '-tAc', q]).toString().trim()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch()
const run = (script, ...args) => { const r = spawnSync('npx', ['tsx', script, ...args], { cwd: APPDIR, env: { ...process.env, PORTAL_DATABASE_URL: DBURL }, encoding: 'utf8' }); return { code: r.status, out: (r.stdout ?? '') + (r.stderr ?? '') } }

async function enrolled(email, ip, extra = {}) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { 'x-real-ip': ip }, ...extra })
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
const A = 'ayesha.sample@example.invalid', B = 'bilal.sample@example.invalid', C = 'carol.sample@example.invalid'
sql(`update identity."user" set name = 'Dr Ayesha Sample' where email = '${A}'`)
sql(`update identity."user" set name = 'Bilal Sample' where email = '${B}'`)
sql(`update identity."user" set name = 'Carol Sample' where email = '${C}'`)
const aId = sql(`select id from identity."user" where email = '${A}'`), bId = sql(`select id from identity."user" where email = '${B}'`), cId = sql(`select id from identity."user" where email = '${C}'`)
const roles = (...a) => run('scripts/identity-roles.ts', ...a)
const dept = 'Computer Science (sample)'
roles('set-department', A, dept); roles('set-department', B, dept); roles('grant-reviewer', B)

const ga = await enrolled(A, '203.0.113.51'); await sleep(800)
const gb = await enrolled(B, '203.0.113.52'); await sleep(800)
const gc = await enrolled(C, '203.0.113.53')
const pa = ga.page, pb = gb.page, pc = gc.page
const text = async (p, url) => { await p.goto(ORIGIN + url); return p.locator('main').innerText() }
const logText = async (p) => { await p.goto(ORIGIN + '/portal/notifications'); return (await p.getByTestId('log-list').count()) ? p.getByTestId('log-list').innerText() : '' }
const waitText = async (p) => { await p.goto(ORIGIN + '/portal/notifications'); return (await p.getByTestId('waiting-list').count()) ? p.getByTestId('waiting-list').innerText() : '' }

// ---- security notices are immediate
let t = await logText(pa)
rec('N1 right after enrolment, Ayesha’s log already holds the two security notices (passkey added, recovery codes), marked "sent at once", with no waiting', /A passkey was added to your account\./.test(t) && /New recovery codes were issued\./.test(t) && (t.match(/Security notice, sent at once/g) ?? []).length === 2 && (await pa.getByTestId('waiting-empty').count()) === 1, t.replace(/\s+/g, ' ').slice(0, 120))
const noMail = await pa.getByTestId('no-mail').innerText()
rec('N2 the page says plainly that no email is sent and the log is what would be sent, shows the Sample badge, and says security notices cannot be turned off', /No email is sent/.test(noMail) && (await pa.getByText('Sample', { exact: true }).count()) >= 1 && /always sent at once, and you cannot turn them off/.test(await pa.locator('main').innerText()), noMail.slice(0, 80))
await pa.screenshot({ path: `${SHOTS}/notices-first-desktop.png`, fullPage: true })

// ---- the preference
const daily = await pa.getByTestId('cadence-daily').isChecked()
await pa.getByTestId('cadence-daily').focus()
await pa.keyboard.press('ArrowDown')
const weeklyByKey = await pa.getByTestId('cadence-weekly').isChecked()
await pa.getByTestId('cadence-save').click()
await pa.getByText('Saved.').waitFor()
await pa.reload()
rec('N3 Ayesha starts on "once a day", changes to weekly with the keyboard, saves, and the choice is still there after a reload', daily && weeklyByKey && (await pa.getByTestId('cadence-weekly').isChecked()) && sql(`select cadence from identity.notification_pref where "userId" = '${aId}'`) === 'weekly', 'daily → weekly')

// ---- delegation: immediate notice for the grantor, a waiting line for the delegate, and changes are counted, views are not
await pa.goto(ORIGIN + '/portal/delegation')
await pa.getByLabel('Colleague’s email address').fill(B)
await pa.getByLabel('Courses', { exact: true }).check()
await pa.getByLabel('Number of days').fill('30')
await pa.getByRole('button', { name: 'Give access' }).click()
await pa.getByTestId('grant-ok').waitFor()
t = await logText(pa)
rec('N4 giving access shows up in Ayesha’s log at once as a security notice, not in her waiting list', /You gave a colleague access to part of your page\./.test(t) && (await pa.getByTestId('waiting-empty').count()) === 1, 'security notice')
let wb = await waitText(pb)
rec('N5 Bilal has one waiting line that a colleague gave him access, and no notice in his log for it', /A colleague gave you access to part of their page \(once\)\./.test(wb) && !/gave a colleague access/.test(await logText(pb)), wb.replace(/\s+/g, ' '))
await pb.goto(`${ORIGIN}/portal/courses?for=${aId}`)
await pb.getByTestId('delegation-banner').waitFor()
const afterView = await waitText(pa)
await pb.goto(`${ORIGIN}/portal/courses?for=${aId}`)
await pb.getByLabel('Course code').fill('CS-501'); await pb.getByLabel('Course title').fill('Sample Notices'); await pb.getByRole('button', { name: 'Add course' }).click()
await pb.getByText('Course added.').waitFor()
const afterEdit = await waitText(pa)
rec('N6 Bilal only looking at Ayesha’s page adds nothing for her; his change adds one line ("1 change was made on your behalf by a colleague"), and the line names nobody', afterView === '' && /1 change was made on your behalf by a colleague\./.test(afterEdit) && !/Bilal/.test(afterEdit), afterEdit.replace(/\s+/g, ' '))

// ---- submission and decision
await pa.goto(ORIGIN + '/portal/profile')
await pa.getByLabel('About you, in English').fill('Sample bio for the notices run, UNIQUE-BIO-TEXT-5521.')
await pa.getByRole('button', { name: 'Save and send for review' }).click()
await pa.getByText('Sent for review.', { exact: true }).waitFor({ timeout: 15000 })
wb = await waitText(pb)
rec('N7 when Ayesha sends her profile for review, Bilal (the department’s reviewer) has one waiting line, and Ayesha and Carol have none for it', /1 profile is waiting for your review\./.test(wb) && !/waiting for your review/.test(await waitText(pa)) && !/waiting for your review/.test(await waitText(pc)), wb.replace(/\s+/g, ' '))
await pb.goto(`${ORIGIN}/portal/review/${aId}`)
await pb.getByTestId('approve').click()
await pb.waitForURL('**/portal/review?decided=approved', { timeout: 15000 })
const wa = await waitText(pa)
rec('N8 when Bilal approves, Ayesha has a waiting line "approved", and Bilal has none for his own decision', /Your profile changes were approved \(once\)\./.test(wa) && !/approved/.test(await waitText(pb)), wa.replace(/\s+/g, ' '))
await pa.screenshot({ path: `${SHOTS}/notices-waiting-desktop.png`, fullPage: true })

// ---- the digest command
const dry = run('scripts/identity-digest.ts', '--dry-run')
const noDigestYet = sql(`select count(*) from identity.notice_log where class = 'digest'`) === '0'
rec('N9 the dry run counts the people with items waiting and writes nothing', dry.code === 0 && /people with items waiting: \{"people":\d+\}/.test(dry.out) && noDigestYet, dry.out.trim())
const bad = run('scripts/identity-digest.ts', '--everyone')
rec('N10 the command refuses any other argument', bad.code === 2 && /usage/.test(bad.out), bad.out.trim().slice(0, 60))
const real = run('scripts/identity-digest.ts')
const m = real.out.match(/"built":(\d+)/)
rec('N11 the real run builds one digest for each person with items waiting, and prints counts only', real.code === 0 && m && Number(m[1]) === 2 && !/@|Sample|Ayesha|Bilal/.test(real.out) && sql(`select count(*) from identity.notice_log where class = 'digest'`) === '2', real.out.trim())
t = await logText(pa)
const aDigest = (await pa.getByTestId('log-list').locator('[data-class=digest]').innerText())
rec('N12 Ayesha’s log shows one weekly summary with both lines (the change on her behalf, the approval), her waiting list is empty, and the security notices are still there', /Summary \(weekly\)/.test(aDigest) && /1 change was made on your behalf by a colleague\./.test(aDigest) && /Your profile changes were approved \(once\)\./.test(aDigest) && (await pa.getByTestId('waiting-empty').count()) === 1 && /A passkey was added/.test(t), aDigest.replace(/\s+/g, ' ').slice(0, 140))
await pa.screenshot({ path: `${SHOTS}/notices-digest-desktop.png`, fullPage: true })
await pb.goto(ORIGIN + '/portal/notifications')
const bDigest = await pb.getByTestId('log-list').locator('[data-class=digest]').innerText()
rec('N13 Bilal’s summary is a daily one with his two lines (access given to him, a profile waiting), as one entry, not one message each', /Summary \(daily\)/.test(bDigest) && /A colleague gave you access/.test(bDigest) && /1 profile is waiting for your review/.test(bDigest) && (await pb.getByTestId('log-list').locator('[data-class=digest]').count()) === 1, bDigest.replace(/\s+/g, ' ').slice(0, 140))
const second = run('scripts/identity-digest.ts')
rec('N14 a second run straight away builds nothing, and nobody has more than one summary', second.code === 0 && /"built":0/.test(second.out) && sql(`select count(*) from identity.notice_log where class = 'digest'`) === '2', second.out.trim())

// ---- "off" stops the summary, never the security notices
await pa.goto(ORIGIN + '/portal/notifications')
await pa.getByTestId('cadence-off').check()
await pa.getByTestId('cadence-save').click()
await pa.getByText('Saved.').waitFor()
await pb.goto(`${ORIGIN}/portal/courses?for=${aId}`)
await pb.getByLabel('Course code').fill('CS-502'); await pb.getByLabel('Course title').fill('Another Sample'); await pb.getByRole('button', { name: 'Add course' }).click()
await pb.getByText('Course added.').waitFor()
const offWaiting = sql(`select count(*) from identity.notification where "userId" = '${aId}' and "digestId" is null`)
await pa.goto(ORIGIN + '/portal/delegation')
await pa.getByLabel('Colleague’s email address').fill(B)
await pa.getByLabel('Courses', { exact: true }).check()
await pa.getByRole('button', { name: 'Give access' }).click()
await pa.getByTestId('grant-ok').waitFor()
t = await logText(pa)
rec('N15 with the summary turned off, a colleague’s change queues nothing for Ayesha, but a new delegation still appears in her log at once', offWaiting === '0' && (t.match(/You gave a colleague access/g) ?? []).length === 2, `waiting ${offWaiting}`)

// ---- nothing about other people, nothing secret
const aHtml = await pa.content()
rec('N16 Ayesha’s notices page names nobody else and holds no email, note or profile text', !/Bilal|Carol|@example\.invalid|UNIQUE-BIO-TEXT/.test(await pa.locator('main').innerText()) && !/Bilal|Carol|UNIQUE-BIO-TEXT/.test(aHtml.replace(/ayesha\.sample@example\.invalid/g, '')), 'clean')
const rows = sql(`select string_agg(to_jsonb(n.*)::text, ' ') from identity.notification n`) + sql(`select string_agg(to_jsonb(l.*)::text, ' ') from identity.notice_log l`)
rec('N17 the stored queue and log hold no name, email or profile text', !/Sample|@example|UNIQUE-BIO/.test(rows), `${rows.length} characters checked`)
const cLog = await logText(pc)
rec('N18 Carol, who did nothing, sees only her own two enrolment notices and nothing waiting', (cLog.match(/Security notice, sent at once/g) ?? []).length === 2 && !/delegation|colleague/i.test(cLog) && (await pc.getByTestId('waiting-empty').count()) === 1, 'own notices only')
const anon = await browser.newContext()
const ap = await anon.newPage()
await ap.goto(ORIGIN + '/portal/notifications')
rec('N19 without signing in the page is not shown: the visitor lands on the sign-in page', /\/portal\/sign-in/.test(ap.url()) && (await ap.getByRole('heading', { name: 'Notices' }).count()) === 0, ap.url().replace(ORIGIN, ''))
await anon.close()

// ---- navigation, narrow screen, keyboard
await pa.goto(ORIGIN + '/portal')
await pa.getByRole('link', { name: 'Choose how often you get a summary of changes' }).click()
await pa.waitForURL('**/portal/notifications')
await pa.getByRole('link', { name: 'Notices' }).first().click()
rec('N20 the home page and the menu both lead to the notices page', /\/portal\/notifications/.test(pa.url()), pa.url().replace(ORIGIN, ''))
await pa.setViewportSize({ width: 390, height: 844 })
await pa.goto(ORIGIN + '/portal/notifications')
const w = await pa.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
const radios = await pa.getByRole('radio').evaluateAll((rs) => rs.map((r) => { const b = r.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)] }))
await pa.screenshot({ path: `${SHOTS}/notices-390.png`, fullPage: true })
rec('N21 at 390 px the page does not scroll sideways and the radio buttons are at least 24 px', w[0] <= w[1] && radios.every(([x, y]) => x >= 24 && y >= 24), `scroll ${w}, radios ${radios.map((r) => r.join('x')).join(' ')}`)
const names = await pa.evaluate(() => [...document.querySelectorAll('input[type=radio]')].map((i) => i.labels?.[0]?.textContent?.trim() ?? ''))
rec('N22 every choice has a label and the group has a legend', names.length === 3 && names.every((n) => n.length > 0) && (await pa.getByRole('group', { name: /How often should we send the summary/ }).count()) === 1, names.join(' | '))

fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), results }, null, 2))
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
