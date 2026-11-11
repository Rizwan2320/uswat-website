import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')
import crypto from 'node:crypto'
import fs from 'node:fs'
import pg from 'pg'

const PORT = Number(process.env.PORT), MODE = process.env.UV_MODE
const ORIGIN = `http://localhost:${PORT}`
const AUTH_BASE = process.env.AUTH_BASE || '/api/auth', PAGE = process.env.PAGE || '/', DB_NAME = process.env.DB_NAME || 'fp0'
const db = new pg.Client({ connectionString: 'postgres://postgres@127.0.0.1:5544/' + DB_NAME, options: '-c search_path=identity' })
await db.connect()
const results = []
const rec = (id, ok, note) => { results.push({ id, ok, note }); console.log(`${ok === true ? 'PASS' : ok === false ? 'FAIL' : 'INFO'} ${id}: ${note}`) }
const short = (v) => JSON.stringify(v)?.slice(0, 220)

// RFC 6238 TOTP (6 digits, 30 s, SHA-1), used only to play the authenticator app in the test
const b32 = (s) => { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = ''; for (const c of s.replace(/=+$/, '')) bits += A.indexOf(c).toString(2).padStart(5, '0'); const out = []; for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2)); return Buffer.from(out) }
const totp = (secret, step = 0) => { const c = Math.floor(Date.now() / 30000) + step; const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(c)); const h = crypto.createHmac('sha1', b32(secret)).update(b).digest(); const o = h[19] & 15; return String(((h.readUInt32BE(o) & 0x7fffffff) % 1e6)).padStart(6, '0') }

const browser = await chromium.launch()
const ctx = await browser.newContext()
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
await cdp.send('WebAuthn.enable')
const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } })
await page.goto(ORIGIN + PAGE)
const call = (expr, arg) => page.evaluate(`(async()=>{ try { const r = await (${expr}); return { data: r?.data ?? null, error: r?.error ?? null } } catch(e){ return { thrown: String(e).slice(0,200) } } })()`)
const setCookies = []
page.on('response', async (r) => { if (r.url().includes(AUTH_BASE + '/')) { const h = await r.headersArray().catch(() => []); for (const x of h) if (x.name.toLowerCase() === 'set-cookie') setCookies.push({ url: r.url().replace(ORIGIN, ''), v: x.value }) } })

const stamp = Date.now()
const u1 = { email: `a${stamp}@example.test`, name: 'Sample One', password: 'correct horse battery staple 1' }
const u2 = { email: `b${stamp}@example.test`, name: 'Sample Two', password: 'another long passphrase here 2' }

// A. password policy (AUTH-03): 14 chars rejected, 15 accepted
let r = await call(`authClient.signUp.email(${JSON.stringify({ email: `s${stamp}@example.test`, name: 'S', password: 'a'.repeat(14) })})`)
rec('A1 AUTH-03 14-char password rejected', !!r.error, short(r.error || r.data))
r = await call(`authClient.signUp.email(${JSON.stringify(u1)})`)
rec('A2 AUTH-03 long passphrase accepted (no composition rules)', !!r.data && !r.error, short(r.error || { user: !!r.data?.user }))

// B. AUTH-01: is there a usable session with NO second factor enrolled?
r = await call(`authClient.getSession()`)
rec('B1 AUTH-01 session granted straight after sign-up with password only', r.data?.session ? 'INFO' : 'INFO', r.data?.session ? 'YES: library issues a full session with no second factor (needs our enrolment gate)' : 'no session')
await call(`authClient.signOut()`)
r = await call(`authClient.signIn.email(${JSON.stringify({ email: u1.email, password: u1.password })})`)
const b2 = !!r.data?.token || !!r.data?.user
rec('B2 AUTH-01 password-only sign-in works when 2FA not enrolled', 'INFO', b2 ? 'YES: password-only login path exists until we block it' : 'no: ' + short(r))

// C. passkey registration and sign-in
r = await call(`authClient.passkey.addPasskey({ name: 'virtual device' })`)
rec('C1 passkey registration (UV=1 authenticator)', !!r.data && !r.error && !r.thrown, short(r))
await call(`authClient.signOut()`)
r = await call(`authClient.signIn.passkey()`)
let sess = await call(`authClient.getSession()`)
rec('C2 passkey sign-in (UV=1)', !!sess.data?.session, short(r.error || r.thrown || 'session ok'))

// D. UV=0 assertion: rewrite the options to "discouraged" so the authenticator produces UV=0
await cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: false })
await page.route('**' + AUTH_BASE + '/passkey/generate-authenticate-options*', async (route) => {
  const resp = await route.fetch(); const j = await resp.json(); j.userVerification = 'discouraged'
  await route.fulfill({ response: resp, json: j })
})
await call(`authClient.signOut()`)
r = await call(`authClient.signIn.passkey()`)
sess = await call(`authClient.getSession()`)
const uv0Accepted = !!sess.data?.session
rec(`D1 FPR-01 assertion with UV=0 rejected [mode=${MODE}]`, MODE === 'required' ? !uv0Accepted : 'INFO', `UV=0 assertion ${uv0Accepted ? 'ACCEPTED' : 'rejected'}; ${short(r.error || r.thrown || '')}`)
await call(`authClient.signOut()`)
const rewriteWithUv1 = async () => { // does the "discouraged" rewrite on its own change the outcome when the authenticator IS verified?
  await cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: true })
  await call(`authClient.signOut()`)
  const rr = await call(`authClient.signIn.passkey()`)
  const ss = await call(`authClient.getSession()`)
  rec(`D2 info: rewritten options + verified authenticator [mode=${MODE}]`, 'INFO', `session ${ss.data?.session ? 'granted' : 'refused'}; ${short(rr.error || rr.thrown || '')}`)
}
await rewriteWithUv1()
await page.unroute('**' + AUTH_BASE + '/passkey/generate-authenticate-options*')
await call(`authClient.signOut()`)
r = await call(`authClient.signIn.passkey()`)
sess = await call(`authClient.getSession()`)
rec('D3 control: no rewrite, verified authenticator, still signs in after the failed attempts', !!sess.data?.session, short(r.error || r.thrown || 'session ok'))

// G. cookie attributes and session storage (fresh password sign-in so a session exists)
await call(`authClient.signOut()`)
setCookies.length = 0
await call(`authClient.signIn.email(${JSON.stringify({ email: u1.email, password: u1.password })})`)
const cks = await ctx.cookies()
for (const c of cks) rec('G1 cookie ' + c.name, 'INFO', `secure=${c.secure} httpOnly=${c.httpOnly} sameSite=${c.sameSite} path=${c.path} domain=${c.domain}`)
const sc = setCookies.filter(x => /session_token=[^;]/.test(x.v)).pop()
rec('G2 raw Set-Cookie (session)', 'INFO', sc ? sc.v.replace(/=[^;]+/, '=<value>') : 'none seen')
const row = (await db.query(`select token, "expiresAt" from session order by "createdAt" desc limit 1`)).rows[0]
rec('G3 SES-01 session stored server-side in PostgreSQL', !!row, row ? `token column length ${row.token.length}, stored as raw value (not a hash)` : 'no row')
const ck = cks.find(c => /session_token/.test(c.name))
rec('G4 cookie value is the DB token plus a signature (a DB leak alone is not enough to forge it)', 'INFO', ck ? `cookie value length ${decodeURIComponent(ck.value).length} vs token length ${row.token.length}` : 'no cookie')

// FPR-07: revoke -> next request has no session
const tok = (await call(`authClient.getSession()`)).data?.session?.token
await call(`authClient.revokeSession(${JSON.stringify({ token: tok })})`)
const after = await call(`authClient.getSession()`)
rec('G5 FPR-07 revoked session is dead on the very next request', !after.data?.session, after.data?.session ? 'still valid' : 'no session on next request')

// H. origin/CSRF check
const bad = await fetch(ORIGIN + AUTH_BASE + '/sign-in/email', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://evil.example' }, body: JSON.stringify({ email: u1.email, password: u1.password }) })
rec('H1 SES-06 cross-origin sign-in POST refused', bad.status === 403, 'status ' + bad.status)

// I. AUTH-10: do responses reveal whether an email exists?
const a = await fetch(ORIGIN + AUTH_BASE + '/sign-in/email', { method: 'POST', headers: { 'content-type': 'application/json', origin: ORIGIN }, body: JSON.stringify({ email: 'nobody' + stamp + '@example.test', password: 'x'.repeat(16) }) })
const b = await fetch(ORIGIN + AUTH_BASE + '/sign-in/email', { method: 'POST', headers: { 'content-type': 'application/json', origin: ORIGIN }, body: JSON.stringify({ email: u1.email, password: 'x'.repeat(16) }) })
const [at, bt] = [await a.text(), await b.text()]
rec('I1 AUTH-10 unknown email and wrong password look the same', a.status === b.status && at === bt, `unknown: ${a.status} ${at.slice(0, 90)} | wrong pw: ${b.status} ${bt.slice(0, 90)}`)

// E/F. TOTP and recovery codes on user 2
await call(`authClient.signUp.email(${JSON.stringify(u2)})`)
const en = await call(`authClient.twoFactor.enable(${JSON.stringify({ password: u2.password })})`)
const uri = en.data?.totpURI, codes = en.data?.backupCodes || []
const secret = uri && new URL(uri).searchParams.get('secret')
rec('E1 TOTP enrolment returns a secret URI', !!secret, uri ? uri.replace(/secret=[^&]+/, 'secret=<hidden>') : short(en))
rec('F1 AUTH-05 ten recovery codes issued', codes.length === 10, `count=${codes.length}`)
const c1 = totp(secret)
r = await call(`authClient.twoFactor.verifyTotp(${JSON.stringify({ code: c1 })})`)
rec('E2 TOTP code verifies and enrols', !!r.data && !r.error, short(r.error || 'ok'))
const tf = (await db.query(`select secret, "backupCodes" from "twoFactor" order by 1 limit 5`)).rows.pop()
rec('E3 AUTH-04 TOTP secret not stored in plain base32', tf && tf.secret !== secret, tf ? `stored value looks ${/^[A-Z2-7]+$/.test(tf.secret) ? 'PLAIN' : 'encrypted/opaque'} (len ${tf.secret.length})` : 'no row')
const plainInStore = tf && codes.some(c => tf.backupCodes.includes(c))
rec('F2 AUTH-05 recovery codes stored hashed (not recoverable plaintext)', 'INFO', `plaintext code found in stored column: ${plainInStore}; stored format starts "${tf?.backupCodes.slice(0, 18)}…" (library default is reversible encryption, not a hash)`)

await call(`authClient.signOut()`)
r = await call(`authClient.signIn.email(${JSON.stringify({ email: u2.email, password: u2.password })})`)
rec('E4 sign-in with 2FA enrolled returns a second-factor challenge, no session yet', r.data?.twoFactorRedirect === true && !(await call('authClient.getSession()')).data?.session, short(r.data || r.error))
r = await call(`authClient.twoFactor.verifyTotp(${JSON.stringify({ code: c1 })})`)
const replayOk = !!r.data && !r.error
rec('E5 AUTH-04/PJ2 replayed TOTP code (same 30 s step) rejected', !replayOk, replayOk ? 'REPLAY ACCEPTED' : 'rejected: ' + short(r.error))
if (!replayOk) { /* still need a session for the recovery tests */ }
await call(`authClient.signOut()`)
await call(`authClient.signIn.email(${JSON.stringify({ email: u2.email, password: u2.password })})`)
r = await call(`authClient.twoFactor.verifyBackupCode(${JSON.stringify({ code: codes[0] })})`)
rec('F3 recovery code signs in', !!r.data && !r.error, short(r.error || 'ok'))
await call(`authClient.signOut()`)
await call(`authClient.signIn.email(${JSON.stringify({ email: u2.email, password: u2.password })})`)
r = await call(`authClient.twoFactor.verifyBackupCode(${JSON.stringify({ code: codes[0] })})`)
rec('F4 AUTH-05 recovery code is single-use', !!r.error && !r.data, short(r.error || 'REUSED OK'))
r = await call(`authClient.twoFactor.verifyBackupCode(${JSON.stringify({ code: codes[1] })})`)
const s2 = await call('authClient.getSession()')
const regen = await call(`authClient.twoFactor.generateBackupCodes(${JSON.stringify({ password: u2.password })})`)
await call(`authClient.signOut()`)
await call(`authClient.signIn.email(${JSON.stringify({ email: u2.email, password: u2.password })})`)
r = await call(`authClient.twoFactor.verifyBackupCode(${JSON.stringify({ code: codes[2] })})`)
rec('F5 AUTH-05 regenerating invalidates the old set', !!regen.data?.backupCodes && !!r.error, `new set ${regen.data?.backupCodes?.length ?? 'none'}; old code after regenerate: ${r.error ? 'rejected' : 'ACCEPTED'}`)

// J. where did the tables go?
const t = await db.query(`select table_schema, table_name from information_schema.tables where table_schema in ('identity','public') order by 1,2`)
const names = ['user','session','account','verification','passkey','twoFactor']
const inIdentity = t.rows.filter(x => x.table_schema === 'identity').map(x => x.table_name)
const strayInPublic = t.rows.filter(x => x.table_schema === 'public' && names.includes(x.table_name)).map(x => x.table_name)
rec('J1 the six identity tables live in schema identity and none of those names exist in public', names.every(n => inIdentity.includes(n)) && strayInPublic.length === 0, `identity: ${inIdentity.sort().join(', ')}; public tables in this database: ${t.rows.filter(x => x.table_schema === 'public').length}; stray: ${strayInPublic.join(',') || 'none'}`)

fs.writeFileSync(`out/results-${process.env.TAG || MODE}.json`, JSON.stringify(results, null, 2))
await browser.close(); await db.end()
