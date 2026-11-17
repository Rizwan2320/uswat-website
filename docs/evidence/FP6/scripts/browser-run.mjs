/**
 * FP-6: the real passkey flows in Chromium (CDP virtual authenticator, no hardware) against the running app.
 * Env: ORIGIN (http://localhost:3040), CLIENT_BUNDLE (path to the esbuild bundle of client.src.mjs),
 *      EMAIL, PASSWORD (a user made with seed-user.ts), OUT (results json path).
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')

const { ORIGIN, CLIENT_BUNDLE, EMAIL, PASSWORD, OUT } = process.env
const BASE = '/portal-api/auth'
const bundle = fs.readFileSync(CLIENT_BUNDLE, 'utf8')
const results = []
const rec = (id, ok, note) => {
  results.push({ id, ok, note })
  console.log(`${ok === true ? 'PASS' : ok === false ? 'FAIL' : 'INFO'} ${id}: ${note}`)
}
const short = (v) => JSON.stringify(v)?.slice(0, 200)

const browser = await chromium.launch()

async function newClient() {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true },
  })
  await page.goto(ORIGIN + '/')
  await page.evaluate(bundle)
  const call = (expr) =>
    page.evaluate(`(async()=>{ try { const r = await (${expr}); return { data: r?.data ?? null, error: r?.error ?? null } } catch(e){ return { thrown: String(e).slice(0,200) } } })()`)
  // status of a plain request to the portal route, with the page's cookies and origin
  const status = (path, method = 'GET', body) =>
    page.evaluate(
      async ({ path, method, body }) => {
        const r = await fetch(path, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
        let j = null
        try { j = await r.json() } catch {}
        return { status: r.status, body: j }
      },
      { path: BASE + path, method, body },
    )
  return { ctx, page, cdp, authenticatorId, call, status }
}

const A = await newClient()

// S1: a password-only session with no factor enrolled
let r = await A.call(`authClient.signIn.email(${JSON.stringify({ email: EMAIL, password: PASSWORD })})`)
rec('S1a password sign-in works for an account with no factor (so it can enrol)', !!(r.data?.token || r.data?.user), short(r.error || r.thrown || { user: !!r.data?.user }))
let p = await A.status('/passkey/list-user-passkeys')
rec('S1b AUTH-01 protected path refused to a password-only session with no factor', p.status === 403, `status ${p.status} ${short(p.body)}`)
p = await A.status('/get-session')
rec('S1c own session can still be read', p.status === 200, `status ${p.status}`)

// S2: register the first passkey from that session: the session becomes strong
r = await A.call(`authClient.passkey.addPasskey({ name: 'virtual device' })`)
rec('S2a first passkey registered from the password session (UV required)', !!r.data && !r.error && !r.thrown, short(r.error || r.thrown || r.data))
p = await A.status('/passkey/list-user-passkeys')
rec('S2b the session is strong after registering the first factor: protected path open', p.status === 200, `status ${p.status}`)

// S3: password only again, now that a passkey exists
await A.call(`authClient.signOut()`)
r = await A.call(`authClient.signIn.email(${JSON.stringify({ email: EMAIL, password: PASSWORD })})`)
rec('S3a password sign-in still gives a (weak) session for an account that has only a passkey', !!(r.data?.token || r.data?.user), short(r.error || r.thrown || { user: !!r.data?.user }))
p = await A.status('/passkey/list-user-passkeys')
rec('S3b AUTH-01 a password alone does NOT open the portal for an account with a passkey', p.status === 403, `status ${p.status} ${short(p.body)}`)
p = await A.status('/two-factor/enable', 'POST', { password: PASSWORD })
rec('S3c a password-only session cannot add a TOTP to an account that already has a passkey', p.status === 403, `status ${p.status}`)
p = await A.status('/passkey/generate-register-options')
rec('S3d a password-only session cannot start adding a second passkey', p.status === 403, `status ${p.status}`)

// S4: passkey sign-in with user verification
await A.call(`authClient.signOut()`)
r = await A.call(`authClient.signIn.passkey()`)
p = await A.status('/get-session')
rec('S4a passkey sign-in (UV=1) gives a session', p.status === 200, short(r.error || r.thrown || 'session ok'))
p = await A.status('/passkey/list-user-passkeys')
rec('S4b a passkey sign-in session is strong: protected path open', p.status === 200, `status ${p.status}`)
p = await A.status('/passkey/generate-register-options')
rec('S4c a strong session may start enrolling a further passkey', p.status === 200, `status ${p.status}`)

// S5: user verification 0 is rejected (FPR-01, AUTH-02), with the default sign-in path
await A.cdp.send('WebAuthn.setUserVerified', { authenticatorId: A.authenticatorId, isUserVerified: false })
await A.page.route('**' + BASE + '/passkey/generate-authenticate-options*', async (route) => {
  const resp = await route.fetch(); const j = await resp.json(); j.userVerification = 'discouraged'
  await route.fulfill({ response: resp, json: j })
})
await A.call(`authClient.signOut()`)
r = await A.call(`authClient.signIn.passkey()`)
p = await A.status('/get-session')
rec('S5 FPR-01 an assertion with UV=0 is rejected: no session', p.status === 401, `get-session ${p.status}; ${short(r.error || r.thrown || '')}`)
await A.page.unroute('**' + BASE + '/passkey/generate-authenticate-options*')
await A.cdp.send('WebAuthn.setUserVerified', { authenticatorId: A.authenticatorId, isUserVerified: true })

// S6: recovery codes from a passkey session, used from a fresh browser (lost device)
await A.call(`authClient.signOut()`)
await A.call(`authClient.signIn.passkey()`)
const issued = await A.status('/recovery/issue', 'POST', {})
const codes = issued.body?.codes ?? []
rec('S6a recovery codes issued from a strong passkey session', issued.status === 200 && codes.length === 10, `status ${issued.status}, ${codes.length} codes`)
const cks = await A.ctx.cookies()
const sc = cks.find((c) => c.name === '__Host-portal.session_token')
rec('S6b session cookie attributes (SES-01, SES-02)', !!sc && sc.secure && sc.httpOnly && sc.path === '/' && sc.sameSite === 'Lax', sc ? `secure=${sc.secure} httpOnly=${sc.httpOnly} sameSite=${sc.sameSite} path=${sc.path} domain=${sc.domain}` : 'cookie not found: ' + cks.map((c) => c.name).join(','))
const B = await newClient()
const rs = await B.status('/recovery/sign-in', 'POST', { email: EMAIL, password: PASSWORD, code: codes[0] })
rec('S6c PJ3 recovery sign-in from a fresh browser works', rs.status === 200, `status ${rs.status} ${short(rs.body)}`)
p = await B.status('/passkey/list-user-passkeys')
rec('S6d the recovery session is strong: protected path open', p.status === 200, `status ${p.status}`)
p = await A.status('/get-session')
rec('S6e PJ3 the old browser session is dead on its next request', p.status === 401, `status ${p.status}`)
const C = await newClient()
const again = await C.status('/recovery/sign-in', 'POST', { email: EMAIL, password: PASSWORD, code: codes[0] })
rec('S6f a recovery code works once', again.status === 401, `second use status ${again.status}`)

await browser.close()
fs.writeFileSync(OUT, JSON.stringify({ origin: ORIGIN, ranAt: new Date().toISOString(), results }, null, 2))
const failed = results.filter((x) => x.ok === false).length
console.log(`\n${results.filter((x) => x.ok === true).length} pass, ${failed} fail, ${results.filter((x) => x.ok === 'INFO').length} info`)
process.exit(failed ? 1 : 0)
