// @vitest-environment node
/**
 * Identity module against the real library and a real PostgreSQL (local only).
 * Skipped unless IDENTITY_TEST_DATABASE_URL points at a throwaway database, because the first
 * test drops and recreates the `identity` schema in it.
 */
import { symmetricDecrypt } from 'better-auth/crypto'
import pg from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { totpAt } from '../../helpers/totp'
import { readPortalConfig } from '@/modules/identity/config'
import { createPortalAuth, type PortalAuth } from '@/modules/identity/auth'
import { createPgAssuranceStore } from '@/modules/identity/assuranceStore'
import { createRecoveryService } from '@/modules/identity/recoveryService'
import { createPgAttemptStore, createPgRecoveryStore } from '@/modules/identity/recoveryStore'
import { createPgSessionStore } from '@/modules/identity/sessionStore'
import { createPgSharedStore } from '@/modules/identity/sharedStore'
import { createSignInThrottle } from '@/modules/identity/signInThrottle'
import { createPgThrottleStore } from '@/modules/identity/signInThrottleStore'
import { closeIdentityPool, getIdentityPool } from '@/modules/identity/db'
import { loadFactors } from '@/modules/identity/factors'
import { createAuthHandlers, type AuthLike } from '@/modules/identity/handlers'
import { migrateDown, migrateUp } from '@/modules/identity/migrate'

const DB = process.env.IDENTITY_TEST_DATABASE_URL
const ORIGIN = 'http://localhost:3999'
const BASE = `${ORIGIN}/portal-api/auth`
const env = {
  PORTAL_ENABLED: 'true',
  PORTAL_ORIGIN: ORIGIN,
  PORTAL_DATABASE_URL: DB,
  PORTAL_AUTH_SECRET: 'integration-test-secret-0123456789abcdef',
}
const PASSWORD = 'correct horse battery staple 1'

async function snapshot(): Promise<string> {
  const c = new pg.Client({ connectionString: DB })
  await c.connect()
  try {
    const cols = await c.query(
      `select table_name, column_name, data_type, is_nullable from information_schema.columns where table_schema = 'identity' order by 1, 2`,
    )
    const idx = await c.query(`select indexname, indexdef from pg_indexes where schemaname = 'identity' order by 1`)
    const cons = await c.query(
      `select conrelid::regclass::text as t, conname, pg_get_constraintdef(oid) as d from pg_constraint where connamespace = 'identity'::regnamespace order by 1, 2`,
    )
    return JSON.stringify([cols.rows, idx.rows, cons.rows])
  } finally {
    await c.end()
  }
}

describe.skipIf(!DB)('identity schema migration', () => {
  afterAll(async () => {
    await closeIdentityPool()
  })

  it('applies, is idempotent, rolls back to nothing, and re-applies to an identical schema (up, down, up)', async () => {
    await migrateDown(DB!, {})
    const first = await migrateUp(DB!, {})
    expect(first).toEqual(['0001_identity', '0002_session_assurance', '0003_recovery_attempt', '0004_signin_failure', '0005_step_up', '0006_session_shared'])
    const a = await snapshot()
    expect(await migrateUp(DB!, {})).toEqual([])
    await migrateDown(DB!, {})
    const c = new pg.Client({ connectionString: DB })
    await c.connect()
    const gone = await c.query(`select count(*)::int as n from information_schema.schemata where schema_name = 'identity'`)
    await c.end()
    expect(gone.rows[0].n).toBe(0)
    await migrateUp(DB!, {})
    expect(await snapshot()).toBe(a)
  })

  it('leaves the public schema alone', async () => {
    const c = new pg.Client({ connectionString: DB })
    await c.connect()
    const before = await c.query(`select count(*)::int as n from information_schema.tables where table_schema = 'public'`)
    await migrateDown(DB!, {})
    await migrateUp(DB!, {})
    const after = await c.query(`select count(*)::int as n from information_schema.tables where table_schema = 'public'`)
    await c.end()
    expect(after.rows[0].n).toBe(before.rows[0].n)
  })
})

describe.skipIf(!DB)('portal auth API with the real library (FPR-01, PJ2, SES-05)', () => {
  let auth: PortalAuth
  let h: ReturnType<typeof createAuthHandlers>
  let email = ''
  let userId = ''

  beforeAll(async () => {
    await migrateDown(DB!, {})
    await migrateUp(DB!, {})
    const config = readPortalConfig(env)
    if (!config.enabled) throw new Error(`config: ${config.reason}`)
    auth = createPortalAuth(config)
    const pool = getIdentityPool(config.databaseUrl)
    h = createAuthHandlers({
      env,
      getAuth: () => auth as unknown as AuthLike,
      loadFactors: (id) => loadFactors(pool, id),
      isStrongSession: (id) => createPgAssuranceStore(pool).isStrong(id),
      lastVerifiedAt: (id) => createPgAssuranceStore(pool).lastVerifiedAt(id),
      endSession: (id) => createPgSessionStore(pool).end(id),
      touchSession: (id, now) => createPgSessionStore(pool).touch(id, now),
      signInThrottle: createSignInThrottle({ store: createPgThrottleStore(pool) }),
    })
    email = `sample-${Date.now()}@example.test`
    const created = await auth.api.signUpEmail({ body: { email, password: PASSWORD, name: 'Sample Faculty' } })
    userId = created.user.id
  })

  afterAll(async () => {
    await closeIdentityPool()
  })

  let jarSeq = 0
  class Jar {
    /** Each jar is its own client address, so one test's failures never count against another's (ABU-01). */
    readonly ip = `198.18.${Math.floor(++jarSeq / 250)}.${(jarSeq % 250) + 1}`
    private c = new Map<string, string>()
    header() {
      return [...this.c].map(([k, v]) => `${k}=${v}`).join('; ')
    }
    absorb(res: Response) {
      for (const line of res.headers.getSetCookie()) {
        const [pair] = line.split(';')
        const i = pair!.indexOf('=')
        const name = pair!.slice(0, i)
        const val = pair!.slice(i + 1)
        if (val === '' || /max-age=0/i.test(line)) this.c.delete(name)
        else this.c.set(name, val)
      }
    }
  }

  async function call(jar: Jar, method: 'GET' | 'POST', path: string, body?: unknown) {
    const res = await h[method](
      new Request(`${BASE}${path}`, {
        method,
        headers: { 'content-type': 'application/json', origin: ORIGIN, cookie: jar.header(), 'x-real-ip': jar.ip },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    )
    jar.absorb(res)
    return res
  }

  const passwordSignIn = (jar: Jar) => call(jar, 'POST', '/sign-in/email', { email, password: PASSWORD })

  it('offers no sign-up and no email or SMS code endpoints', async () => {
    const jar = new Jar()
    for (const p of ['/sign-up/email', '/two-factor/send-otp', '/two-factor/verify-otp']) {
      expect((await call(jar, 'POST', p, {})).status, p).toBe(404)
    }
  })

  it('FPR-01: a password-only session cannot reach a protected endpoint', async () => {
    const jar = new Jar()
    const res = await passwordSignIn(jar)
    expect(res.status).toBe(200)
    expect(jar.header()).toContain('__Host-portal.session_token')
    const list = await call(jar, 'GET', '/passkey/list-user-passkeys')
    expect(list.status).toBe(403)
    expect(await list.json()).toMatchObject({ redirectTo: '/portal/enrol' })
    expect((await call(jar, 'GET', '/get-session')).status).toBe(200)
  })

  it('AUTH-02: the server asks the authenticator for user verification "required" when registering and signing in', async () => {
    const jar = new Jar()
    await passwordSignIn(jar)
    const reg = await call(jar, 'GET', '/passkey/generate-register-options')
    expect(reg.status).toBe(200)
    expect(((await reg.json()) as { authenticatorSelection?: { userVerification?: string } }).authenticatorSelection?.userVerification).toBe('required')
    const authn = await call(new Jar(), 'GET', '/passkey/generate-authenticate-options')
    expect(authn.status).toBe(200)
    expect(((await authn.json()) as { userVerification?: string }).userVerification).toBe('required')
  })

  let secret = ''
  const factorJar = new Jar()

  it('enrols TOTP from a password-only session, and the gate then opens', async () => {
    await passwordSignIn(factorJar)
    const enable = await call(factorJar, 'POST', '/two-factor/enable', { password: PASSWORD })
    expect(enable.status).toBe(200)
    const body = (await enable.json()) as { totpURI: string; backupCodes: string[] }
    secret = new URL(body.totpURI).searchParams.get('secret') ?? ''
    expect(secret).not.toBe('')

    // R2 (PR #16 review): the library's own backup codes are reversible, so none may be issued or kept.
    expect(body.backupCodes).toEqual([])
    const c = new pg.Client({ connectionString: DB })
    await c.connect()
    const stored = await c.query<{ backupCodes: string }>(`select "backupCodes" from identity."twoFactor" where "userId" = $1`, [userId])
    await c.end()
    expect(stored.rows).toHaveLength(1)
    const plain = await symmetricDecrypt({ key: env.PORTAL_AUTH_SECRET, data: stored.rows[0]!.backupCodes })
    expect(JSON.parse(plain)).toEqual([])
    const confirm = await call(factorJar, 'POST', '/two-factor/verify-totp', { code: totpAt(secret, Date.now() - 30_000) })
    expect(confirm.status).toBe(200)
    expect((await call(factorJar, 'GET', '/passkey/list-user-passkeys')).status).toBe(200)
  })

  it('PJ2: a replayed TOTP code is rejected at sign-in, a fresh one is accepted', async () => {
    const fresh = totpAt(secret, Date.now())

    const j1 = new Jar()
    const s1 = await passwordSignIn(j1)
    expect(await s1.json()).toMatchObject({ twoFactorRedirect: true })
    const ok = await call(j1, 'POST', '/two-factor/verify-totp', { code: fresh })
    expect(ok.status).toBe(200)

    const j2 = new Jar()
    await passwordSignIn(j2)
    const replay = await call(j2, 'POST', '/two-factor/verify-totp', { code: fresh })
    expect(replay.status).toBe(401)
    expect(j2.header()).not.toContain('session_token')
  })

  it('records each claimed code once, as a hash, and never the code or the account id', async () => {
    const c = new pg.Client({ connectionString: DB })
    await c.connect()
    const { rows } = await c.query(`select "key" from identity.totp_replay`)
    await c.end()
    expect(rows.length).toBeGreaterThanOrEqual(2)
    for (const r of rows) {
      expect(r.key).toMatch(/^[0-9a-f]{64}$/)
      expect(r.key).not.toContain(userId)
    }
  })

  it('SES-05: revoking a session takes effect on the next request', async () => {
    const jar = new Jar()
    const first = await passwordSignIn(jar)
    expect(await first.json()).toMatchObject({ twoFactorRedirect: true })
    // Steps t-1 and t were claimed by the tests above; the next step's code is unused.
    const done = await call(jar, 'POST', '/two-factor/verify-totp', { code: totpAt(secret, Date.now() + 30_000) })
    expect(done.status).toBe(200)
    expect((await call(jar, 'GET', '/get-session')).status).toBe(200)
    const c = new pg.Client({ connectionString: DB })
    await c.connect()
    await c.query(`delete from identity.session where "userId" = $1`, [userId])
    await c.end()
    expect((await call(jar, 'GET', '/get-session')).status).toBe(401)
  })
  it('AUTH-01: a user whose only factor is a passkey cannot reach the portal with a password alone', async () => {
    const other = `passkey-only-${Date.now()}@example.test`
    const made = await auth.api.signUpEmail({ body: { email: other, password: PASSWORD, name: 'Sample Passkey Only' } })
    const c = new pg.Client({ connectionString: DB })
    await c.connect()
    // A registered passkey as the library would store it. The credential is a placeholder: no assertion is made with it.
    await c.query(
      `insert into identity.passkey ("id","name","publicKey","userId","credentialID","counter","deviceType","backedUp") values ($1,'Sample','AAAA',$2,$1,0,'multiDevice',false)`,
      [`pk-${Date.now()}`, made.user.id],
    )
    await c.end()
    const jar = new Jar()
    const res = await call(jar, 'POST', '/sign-in/email', { email: other, password: PASSWORD })
    const protectedCall = await call(jar, 'GET', '/passkey/list-user-passkeys')
    // Either the sign-in itself is refused, or the session is refused at a protected endpoint.
    expect(res.status === 200 ? protectedCall.status : res.status).toBe(403)
    // It may not add a second authenticator either: that needs a session made with the first.
    const add = await call(jar, 'POST', '/two-factor/enable', { password: PASSWORD })
    expect(add.status).toBe(403)
    expect(await add.json()).toMatchObject({ redirectTo: '/portal/sign-in' })
  })
  // --- FP-3: recovery codes issued and accepted (AUTH-05, PJ3) ---------------------------------

  async function makeEnrolledUser(label: string) {
    const addr = `${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`
    await auth.api.signUpEmail({ body: { email: addr, password: PASSWORD, name: 'Sample Recovery' } })
    const jar = new Jar()
    await call(jar, 'POST', '/sign-in/email', { email: addr, password: PASSWORD })
    const enable = await call(jar, 'POST', '/two-factor/enable', { password: PASSWORD })
    const totpSecret = new URL(((await enable.json()) as { totpURI: string }).totpURI).searchParams.get('secret') ?? ''
    const confirm = await call(jar, 'POST', '/two-factor/verify-totp', { code: totpAt(totpSecret, Date.now()) })
    expect(confirm.status).toBe(200)
    return { addr, jar }
  }
  const issue = async (jar: Jar) => {
    const res = await call(jar, 'POST', '/recovery/issue', {})
    return { res, codes: res.status === 200 ? ((await res.json()) as { codes: string[] }).codes : [] }
  }
  const recoverySignIn = (jar: Jar, addr: string, code: string, password = PASSWORD) =>
    call(jar, 'POST', '/recovery/sign-in', { email: addr, password, code })
  async function sql<T extends Record<string, unknown>>(text: string, params: unknown[] = []) {
    const c = new pg.Client({ connectionString: DB })
    await c.connect()
    try {
      return (await c.query<T>(text, params)).rows
    } finally {
      await c.end()
    }
  }

  it('AUTH-05: issuing needs a session made with a second factor; it returns ten codes once and stores hashes only', async () => {
    const weakUser = `weak-${Date.now()}@example.test`
    await auth.api.signUpEmail({ body: { email: weakUser, password: PASSWORD, name: 'Sample Weak' } })
    const weakJar = new Jar()
    await call(weakJar, 'POST', '/sign-in/email', { email: weakUser, password: PASSWORD })
    expect((await call(weakJar, 'POST', '/recovery/issue', {})).status).toBe(403)

    const { addr, jar } = await makeEnrolledUser('issue')
    const { res, codes } = await issue(jar)
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(codes).toHaveLength(10)
    for (const c of codes) expect(c).toMatch(/^[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/)
    const rows = await sql<{ salt: string; hash: string; usedAt: Date | null }>(
      `select r."salt", r."hash", r."usedAt" from identity.recovery_code r join identity."user" u on u."id" = r."userId" where u."email" = $1`,
      [addr],
    )
    expect(rows).toHaveLength(10)
    const dump = JSON.stringify(rows)
    for (const c of codes) expect(dump).not.toContain(c.replace('-', ''))
    for (const r of rows) expect(r.hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('PJ3: lost device, recovery code, new session; every old session is dead; the code works once; regenerating invalidates the rest', async () => {
    const { addr, jar: oldJar } = await makeEnrolledUser('pj3')
    const { codes } = await issue(oldJar)
    expect((await call(oldJar, 'GET', '/get-session')).status).toBe(200)

    const fresh = new Jar()
    const ok = await recoverySignIn(fresh, addr, codes[0]!)
    expect(ok.status).toBe(200)
    expect(fresh.header()).toContain('__Host-portal.session_token')
    expect(await ok.json()).toMatchObject({ remaining: 9 })

    expect((await call(oldJar, 'GET', '/get-session')).status).toBe(401)
    expect((await call(fresh, 'GET', '/get-session')).status).toBe(200)
    // The new session was made with a recovery code, so it counts as strong: the portal is open to it.
    expect((await call(fresh, 'GET', '/passkey/list-user-passkeys')).status).toBe(200)

    expect((await recoverySignIn(new Jar(), addr, codes[0]!)).status).toBe(401)

    const regenerated = await issue(fresh)
    expect(regenerated.codes).toHaveLength(10)
    expect((await recoverySignIn(new Jar(), addr, codes[1]!)).status).toBe(401)
    expect((await recoverySignIn(new Jar(), addr, regenerated.codes[0]!)).status).toBe(200)
  })

  it('AUTH-10: an unknown email, a wrong password and a wrong code are refused identically', async () => {
    const { addr, jar } = await makeEnrolledUser('uniform')
    const { codes } = await issue(jar)
    const bodies: string[] = []
    for (const [email, password, code] of [
      [`nobody-${Date.now()}@example.test`, PASSWORD, codes[0]!],
      [addr, 'a different long password 2', codes[0]!],
      [addr, PASSWORD, 'AAAAA-AAAAA'],
    ] as const) {
      const res = await recoverySignIn(new Jar(), email, code, password)
      expect(res.status).toBe(401)
      bodies.push(await res.text())
    }
    expect(new Set(bodies).size).toBe(1)
  })

  it('a right code with a wrong password is refused and the code is not spent', async () => {
    const { addr, jar } = await makeEnrolledUser('wrongpw')
    const { codes } = await issue(jar)
    expect((await recoverySignIn(new Jar(), addr, codes[0]!, 'a different long password 2')).status).toBe(401)
    const left = await sql<{ n: string }>(
      `select count(*)::text as n from identity.recovery_code r join identity."user" u on u."id" = r."userId" where u."email" = $1 and r."usedAt" is null`,
      [addr],
    )
    expect(left[0]!.n).toBe('10')
    expect((await recoverySignIn(new Jar(), addr, codes[0]!)).status).toBe(200)
  })

  it('locks the account after five wrong codes: even a right code is refused (the service on the real tables)', async () => {
    const { addr, jar } = await makeEnrolledUser('lock')
    const { codes } = await issue(jar)
    const pool = getIdentityPool(env.PORTAL_DATABASE_URL as string)
    const svc = createRecoveryService({ recovery: createPgRecoveryStore(pool), attempts: createPgAttemptStore(pool) })
    const [u] = await sql<{ id: string }>(`select "id" from identity."user" where "email" = $1`, [addr])
    for (let i = 0; i < 5; i++) expect(await svc.redeem(u!.id, 'AAAAA-AAAAA', Date.now())).toEqual({ status: 'invalid' })
    expect(await svc.redeem(u!.id, codes[0]!, Date.now())).toEqual({ status: 'locked' })
    // and through the route a right code is refused too, whichever of the two brakes answers first
    expect([401, 429]).toContain((await recoverySignIn(new Jar(), addr, codes[0]!)).status)
    const rows = await sql<{ failures: number }>(
      `select a."failures" from identity.recovery_attempt a join identity."user" u on u."id" = a."userId" where u."email" = $1`,
      [addr],
    )
    expect(rows[0]!.failures).toBeGreaterThanOrEqual(5)
  })

  it('two simultaneous sign-ins with the same code: exactly one succeeds', async () => {
    const { addr, jar } = await makeEnrolledUser('race')
    const { codes } = await issue(jar)
    const results = await Promise.all([0, 1, 2].map(() => recoverySignIn(new Jar(), addr, codes[0]!)))
    expect(results.map((r) => r.status).sort()).toEqual([200, 401, 401])
  })
  it('the store spends a code in one conditional statement: five simultaneous spends, exactly one wins', async () => {
    const { addr, jar } = await makeEnrolledUser('spend')
    await issue(jar)
    const pool = getIdentityPool(readPortalConfig(env).enabled ? (env.PORTAL_DATABASE_URL as string) : '')
    const store = createPgRecoveryStore(pool)
    const [u] = await sql<{ id: string }>(`select "id" from identity."user" where "email" = $1`, [addr])
    const rows = await store.list(u!.id)
    const wins = await Promise.all(Array.from({ length: 5 }, () => store.consume(rows[0]!.id, Date.now())))
    expect(wins.filter(Boolean)).toHaveLength(1)
  })
  // --- FP-4: idle timeout and absolute lifetime (SES-04) ---------------------------------------

  async function sessionRow(addr: string) {
    const rows = await sql<{ id: string; updatedAt: Date; createdAt: Date; expiresAt: Date }>(
      `select s."id", s."updatedAt", s."createdAt", s."expiresAt" from identity.session s join identity."user" u on u."id" = s."userId" where u."email" = $1 order by s."createdAt" desc limit 1`,
      [addr],
    )
    return rows[0]
  }
  async function sessionExists(id: string) {
    return (await sql(`select 1 from identity.session where "id" = $1`, [id])).length === 1
  }
  async function age(addr: string, field: 'updatedAt' | 'createdAt', seconds: number) {
    await sql(
      `update identity.session set "${field}" = now() - ($2 || ' seconds')::interval where "id" = (select s."id" from identity.session s join identity."user" u on u."id" = s."userId" where u."email" = $1 order by s."createdAt" desc limit 1)`,
      [addr, String(seconds)],
    )
  }

  it('SES-04: a session idle for 31 minutes is refused and its row is deleted', async () => {
    const { addr, jar } = await makeEnrolledUser('idle')
    expect((await call(jar, 'GET', '/passkey/list-user-passkeys')).status).toBe(200)
    const id = (await sessionRow(addr))!.id
    await age(addr, 'updatedAt', 31 * 60)
    const res = await call(jar, 'GET', '/passkey/list-user-passkeys')
    expect(res.status).toBe(401)
    expect(await sessionExists(id)).toBe(false)
    expect((await call(jar, 'GET', '/get-session')).status).toBe(401)
  })

  it('SES-04: a session created 12 hours and a minute ago is refused however recently it was used', async () => {
    const { addr, jar } = await makeEnrolledUser('absolute')
    const id = (await sessionRow(addr))!.id
    await age(addr, 'createdAt', 12 * 3600 + 60)
    expect((await call(jar, 'GET', '/passkey/list-user-passkeys')).status).toBe(401)
    expect(await sessionExists(id)).toBe(false)
  })

  it('SES-04: use keeps a session alive: activity is recorded and the library does not extend the expiry', async () => {
    const { addr, jar } = await makeEnrolledUser('alive')
    await age(addr, 'updatedAt', 5 * 60)
    const before = (await sessionRow(addr))!
    expect((await call(jar, 'GET', '/passkey/list-user-passkeys')).status).toBe(200)
    expect((await call(jar, 'GET', '/get-session')).status).toBe(200)
    const after = (await sessionRow(addr))!
    expect(Date.now() - after.updatedAt.getTime()).toBeLessThan(10_000)
    expect(after.expiresAt.getTime()).toBe(before.expiresAt.getTime())
  })

  it('SES-04: activity is written at most once a minute', async () => {
    const { addr, jar } = await makeEnrolledUser('throttle')
    await age(addr, 'updatedAt', 10)
    const before = (await sessionRow(addr))!
    expect((await call(jar, 'GET', '/passkey/list-user-passkeys')).status).toBe(200)
    const after = (await sessionRow(addr))!
    expect(after.updatedAt.getTime()).toBe(before.updatedAt.getTime())
  })
  it('the session store itself refuses to write activity more than once a minute', async () => {
    const { addr } = await makeEnrolledUser('storethrottle')
    const pool = getIdentityPool(env.PORTAL_DATABASE_URL as string)
    const store = createPgSessionStore(pool)
    await age(addr, 'updatedAt', 10)
    const before = (await sessionRow(addr))!
    await store.touch(before.id, Date.now())
    expect((await sessionRow(addr))!.updatedAt.getTime()).toBe(before.updatedAt.getTime())
    await age(addr, 'updatedAt', 120)
    const old = (await sessionRow(addr))!
    await store.touch(old.id, Date.now())
    expect((await sessionRow(addr))!.updatedAt.getTime()).toBeGreaterThan(old.updatedAt.getTime())
  })
  // --- FP-5: progressive delay on password sign-in (ABU-01) ------------------------------------

  it('ABU-01: four wrong passwords, then even the right password waits; after the wait it works and the account is cleared', async () => {
    const { addr } = await makeEnrolledUser('delay')
    const jar = new Jar()
    for (let i = 0; i < 4; i++) expect((await call(jar, 'POST', '/sign-in/email', { email: addr, password: 'wrong password number ' + i })).status).toBe(401)
    const blocked = await call(jar, 'POST', '/sign-in/email', { email: addr, password: PASSWORD })
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get('retry-after')).toBe('1')
    // A different address is held by the account counter too.
    expect((await call(new Jar(), 'POST', '/sign-in/email', { email: addr, password: PASSWORD })).status).toBe(429)
    await new Promise((r) => setTimeout(r, 1_100))
    expect((await call(jar, 'POST', '/sign-in/email', { email: addr, password: PASSWORD })).status).toBe(200)
    // cleared: three more failures are free again
    for (let i = 0; i < 3; i++) expect((await call(jar, 'POST', '/sign-in/email', { email: addr, password: 'wrong again ' + i })).status).toBe(401)
  })

  it('ABU-01: no permanent lockout: the wait is bounded and passkey and recovery paths are not held by it', async () => {
    const { addr, jar: strongJar } = await makeEnrolledUser('nolock')
    const { codes } = await issue(strongJar)
    const attacker = new Jar()
    for (let i = 0; i < 6; i++) await call(attacker, 'POST', '/sign-in/email', { email: addr, password: 'guess number ' + i })
    expect((await call(attacker, 'POST', '/sign-in/email', { email: addr, password: PASSWORD })).status).toBe(429)
    // The account's owner can still get in with a recovery code from another address.
    expect((await recoverySignIn(new Jar(), addr, codes[0]!)).status).toBe(200)
    const rows = await sql<{ failures: number; lastFailureAt: Date }>(`select "failures", "lastFailureAt" from identity.signin_failure where "failures" >= 6 order by "lastFailureAt" desc limit 1`)
    expect(rows[0]!.failures).toBeGreaterThanOrEqual(6)
  })

  it('ABU-01: the tables hold hashes only, never an email or an address', async () => {
    const jar = new Jar()
    const target = `hashcheck-${Date.now()}@example.test`
    await call(jar, 'POST', '/sign-in/email', { email: target, password: 'a wrong password here' })
    const rows = await sql<{ key: string }>(`select "key" from identity.signin_failure`)
    expect(rows.length).toBeGreaterThan(0)
    for (const r of rows) {
      expect(r.key).toMatch(/^(password|recovery):[ai]:[0-9a-f]{64}$/)
      expect(r.key).not.toContain(target)
      expect(r.key).not.toContain(jar.ip)
    }
  })

  it('ABU-01: the store counts simultaneous failures: twenty at once leave a count of twenty', async () => {
    const pool = getIdentityPool(env.PORTAL_DATABASE_URL as string)
    const store = createPgThrottleStore(pool)
    const key = `i:${'f'.repeat(64)}`
    await store.reset(key)
    await Promise.all(Array.from({ length: 20 }, () => store.recordFailure(key, Date.now())))
    expect((await store.get(key))!.failures).toBe(20)
  })

  it('ABU-01: the store starts a new count when the last failure is older than an hour', async () => {
    const pool = getIdentityPool(env.PORTAL_DATABASE_URL as string)
    const store = createPgThrottleStore(pool)
    const key = `i:${'e'.repeat(64)}`
    await store.reset(key)
    await store.recordFailure(key, Date.now() - 2 * 3_600_000)
    await store.recordFailure(key, Date.now() - 2 * 3_600_000)
    await store.recordFailure(key, Date.now())
    expect((await store.get(key))!.failures).toBe(1)
  })
  it('ABU-01: wrong passwords at recovery sign-in are counted: four of them and the next attempt waits, whatever the code', async () => {
    const { addr, jar } = await makeEnrolledUser('recpw')
    const { codes } = await issue(jar)
    const attacker = new Jar()
    for (let i = 0; i < 4; i++) expect((await recoverySignIn(attacker, addr, codes[0]!, 'wrong password number ' + i)).status).toBe(401)
    const blocked = await recoverySignIn(attacker, addr, codes[0]!)
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get('retry-after')).toBeTruthy()
    // the code was never touched
    const left = await sql<{ n: string }>(
      `select count(*)::text as n from identity.recovery_code r join identity."user" u on u."id" = r."userId" where u."email" = $1 and r."usedAt" is null`,
      [addr],
    )
    expect(left[0]!.n).toBe('10')
  })
})

describe.skipIf(!DB)('step-up (AUTH-09) and session rotation (SES-03) with the real library', () => {
  let auth: PortalAuth
  let h: ReturnType<typeof createAuthHandlers>
  let pool: pg.Pool
  let seq = 0

  beforeAll(() => {
    const config = readPortalConfig(env)
    if (!config.enabled) throw new Error(`config: ${config.reason}`)
    auth = createPortalAuth(config)
    pool = getIdentityPool(config.databaseUrl)
    h = createAuthHandlers({
      env,
      getAuth: () => auth as unknown as AuthLike,
      loadFactors: (id) => loadFactors(pool, id),
      isStrongSession: (id) => createPgAssuranceStore(pool).isStrong(id),
      lastVerifiedAt: (id) => createPgAssuranceStore(pool).lastVerifiedAt(id),
      endSession: (id) => createPgSessionStore(pool).end(id),
      touchSession: (id, now) => createPgSessionStore(pool).touch(id, now),
      signInThrottle: createSignInThrottle({ store: createPgThrottleStore(pool) }),
    })
  })
  afterAll(async () => {
    await closeIdentityPool()
  })

  class Jar {
    readonly ip = `198.19.0.${(++seq % 250) + 1}`
    private c = new Map<string, string>()
    header() {
      return [...this.c].map(([k, v]) => `${k}=${v}`).join('; ')
    }
    absorb(res: Response) {
      for (const line of res.headers.getSetCookie()) {
        const [pair] = line.split(';')
        const i = pair!.indexOf('=')
        const name = pair!.slice(0, i)
        const val = pair!.slice(i + 1)
        if (val === '' || /max-age=0/i.test(line)) this.c.delete(name)
        else this.c.set(name, val)
      }
    }
  }
  async function call(jar: Jar, method: 'GET' | 'POST', path: string, body?: unknown) {
    const res = await h[method](
      new Request(`${BASE}${path}`, {
        method,
        headers: { 'content-type': 'application/json', origin: ORIGIN, cookie: jar.header(), 'x-real-ip': jar.ip },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    )
    jar.absorb(res)
    return res
  }

  /** A fresh user with a confirmed authenticator app, and a strong session for it. */
  async function userWithTotp() {
    const email = `stepup-${Date.now()}-${++seq}@example.test`
    const made = await auth.api.signUpEmail({ body: { email, password: PASSWORD, name: 'Sample Step Up' } })
    // signUpEmail also opens a session for the new user; drop it so the tests count only what they make.
    await pool.query(`delete from "session" where "userId" = $1`, [made.user.id])
    const jar = new Jar()
    await call(jar, 'POST', '/sign-in/email', { email, password: PASSWORD })
    const enable = (await (await call(jar, 'POST', '/two-factor/enable', { password: PASSWORD })).json()) as { totpURI: string }
    const secret = new URL(enable.totpURI).searchParams.get('secret') ?? ''
    expect((await call(jar, 'POST', '/two-factor/verify-totp', { code: totpAt(secret, Date.now() - 30_000) })).status).toBe(200)
    return { email, userId: made.user.id, secret, jar }
  }
  const sessionIds = async (userId: string) =>
    (await pool.query<{ id: string }>(`select "id" from "session" where "userId" = $1`, [userId])).rows.map((r) => r.id)
  const age = (userId: string, minutes: number) =>
    pool.query(
      `update "session_assurance" set "verifiedAt" = now() - make_interval(mins => $2)
       where "sessionId" in (select "id" from "session" where "userId" = $1)`,
      [userId, minutes],
    )

  it('first-factor enrolment is not asked to step up, and leaves a fresh proof behind', async () => {
    const u = await userWithTotp()
    const [id] = await sessionIds(u.userId)
    const at = await createPgAssuranceStore(pool).lastVerifiedAt(id!)
    expect(Date.now() - at!).toBeLessThan(60_000)
    expect((await call(u.jar, 'POST', '/recovery/issue', {})).status).toBe(200)
  })

  it('a stale proof is refused on every change path, with a pointer to the security page', async () => {
    const u = await userWithTotp()
    await age(u.userId, 11)
    for (const [method, path] of [
      ['POST', '/recovery/issue'],
      ['POST', '/passkey/delete-passkey'],
      ['POST', '/two-factor/enable'],
      ['GET', '/passkey/generate-register-options'],
    ] as const) {
      const res = await call(u.jar, method, path, method === 'POST' ? { id: 'x', password: PASSWORD } : undefined)
      expect(res.status, path).toBe(403)
      expect(await res.json(), path).toMatchObject({ error: 'step-up required', redirectTo: '/portal/security' })
    }
    // read-only paths are not asked
    expect((await call(u.jar, 'GET', '/passkey/list-user-passkeys')).status).toBe(200)
    expect((await call(u.jar, 'GET', '/list-sessions')).status).toBe(200)
  })

  it('exactly ten minutes ago still passes; just over does not', async () => {
    const u = await userWithTotp()
    await age(u.userId, 9)
    expect((await call(u.jar, 'POST', '/recovery/issue', {})).status).toBe(200)
    await age(u.userId, 11)
    expect((await call(u.jar, 'POST', '/recovery/issue', {})).status).toBe(403)
  })

  it('a code from the authenticator app proves it again in place, and the change then goes through', async () => {
    const u = await userWithTotp()
    const before = await sessionIds(u.userId)
    await age(u.userId, 11)
    expect((await call(u.jar, 'POST', '/recovery/issue', {})).status).toBe(403)
    const proof = await call(u.jar, 'POST', '/two-factor/verify-totp', { code: totpAt(u.secret, Date.now()) })
    expect(proof.status).toBe(200)
    expect((await call(u.jar, 'POST', '/recovery/issue', {})).status).toBe(200)
    // in place: the same session, now fresh again
    expect(await sessionIds(u.userId)).toEqual(before)
  })

  it('a wrong code does not refresh the proof', async () => {
    const u = await userWithTotp()
    await age(u.userId, 11)
    const bad = await call(u.jar, 'POST', '/two-factor/verify-totp', { code: '000000' })
    expect(bad.status).toBeGreaterThanOrEqual(400)
    expect((await call(u.jar, 'POST', '/recovery/issue', {})).status).toBe(403)
  })

  it('store: an authentication refreshes the clock, registering a key never does, a new row starts fresh', async () => {
    const u = await userWithTotp()
    const store = createPgAssuranceStore(pool)
    const [id] = await sessionIds(u.userId)
    await age(u.userId, 30)
    const old = (await store.lastVerifiedAt(id!))!
    await store.mark(id!, { verified: false })
    expect(await store.lastVerifiedAt(id!)).toBe(old)
    await store.mark(id!, { verified: true })
    expect(Date.now() - (await store.lastVerifiedAt(id!))!).toBeLessThan(60_000)
    expect(await store.lastVerifiedAt('no-such-session')).toBeNull()
  })

  it('SES-03: enrolling the first factor from a password session gives a new id and ends the old one', async () => {
    const email = `rotate-${Date.now()}-${++seq}@example.test`
    const made = await auth.api.signUpEmail({ body: { email, password: PASSWORD, name: 'Sample Rotate' } })
    await pool.query(`delete from "session" where "userId" = $1`, [made.user.id])
    const jar = new Jar()
    await call(jar, 'POST', '/sign-in/email', { email, password: PASSWORD })
    const [weak] = await sessionIds(made.user.id)
    const enable = (await (await call(jar, 'POST', '/two-factor/enable', { password: PASSWORD })).json()) as { totpURI: string }
    const secret = new URL(enable.totpURI).searchParams.get('secret') ?? ''
    expect((await call(jar, 'POST', '/two-factor/verify-totp', { code: totpAt(secret, Date.now() - 30_000) })).status).toBe(200)
    const after = await sessionIds(made.user.id)
    expect(after).toHaveLength(1)
    expect(after).not.toContain(weak)
    expect(await createPgAssuranceStore(pool).isStrong(after[0]!)).toBe(true)
    expect((await call(jar, 'GET', '/passkey/list-user-passkeys')).status).toBe(200)
  })

  it('SES-03: a failed sign-in ends nothing', async () => {
    const u = await userWithTotp()
    const before = await sessionIds(u.userId)
    await call(u.jar, 'POST', '/sign-in/email', { email: u.email, password: PASSWORD })
    await call(u.jar, 'POST', '/two-factor/verify-totp', { code: '000000' })
    expect(await sessionIds(u.userId)).toEqual(expect.arrayContaining(before))
  })
})

describe.skipIf(!DB)('shared computer (SES-04) with the real library', () => {
  let auth: PortalAuth
  let h: ReturnType<typeof createAuthHandlers>
  let pool: pg.Pool
  let seq = 0

  beforeAll(() => {
    const config = readPortalConfig(env)
    if (!config.enabled) throw new Error(`config: ${config.reason}`)
    auth = createPortalAuth(config)
    pool = getIdentityPool(config.databaseUrl)
    h = createAuthHandlers({
      env,
      getAuth: () => auth as unknown as AuthLike,
      loadFactors: (id) => loadFactors(pool, id),
      isStrongSession: (id) => createPgAssuranceStore(pool).isStrong(id),
      lastVerifiedAt: (id) => createPgAssuranceStore(pool).lastVerifiedAt(id),
      isSharedSession: (id) => createPgSharedStore(pool).isShared(id),
      endSession: (id) => createPgSessionStore(pool).end(id),
      touchSession: (id, now) => createPgSessionStore(pool).touch(id, now),
      signInThrottle: createSignInThrottle({ store: createPgThrottleStore(pool) }),
    })
  })
  afterAll(async () => {
    await closeIdentityPool()
  })

  class Jar {
    readonly ip = `198.20.0.${(++seq % 250) + 1}`
    private c = new Map<string, string>()
    set(name: string, value: string) {
      this.c.set(name, value)
    }
    header() {
      return [...this.c].map(([k, v]) => `${k}=${v}`).join('; ')
    }
    absorb(res: Response) {
      for (const line of res.headers.getSetCookie()) {
        const [pair] = line.split(';')
        const i = pair!.indexOf('=')
        const name = pair!.slice(0, i)
        const val = pair!.slice(i + 1)
        if (val === '' || /max-age=0/i.test(line)) this.c.delete(name)
        else this.c.set(name, val)
      }
    }
  }
  async function call(jar: Jar, method: 'GET' | 'POST', path: string, body?: unknown) {
    const res = await h[method](
      new Request(`${BASE}${path}`, {
        method,
        headers: { 'content-type': 'application/json', origin: ORIGIN, cookie: jar.header(), 'x-real-ip': jar.ip },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    )
    jar.absorb(res)
    return res
  }

  /** A user with a confirmed authenticator app and recovery codes; returns what is needed to sign in again. */
  async function user() {
    const email = `shared-${Date.now()}-${++seq}@example.test`
    const made = await auth.api.signUpEmail({ body: { email, password: PASSWORD, name: 'Sample Shared' } })
    await pool.query(`delete from "session" where "userId" = $1`, [made.user.id])
    const jar = new Jar()
    await call(jar, 'POST', '/sign-in/email', { email, password: PASSWORD })
    const enable = (await (await call(jar, 'POST', '/two-factor/enable', { password: PASSWORD })).json()) as { totpURI: string }
    const secret = new URL(enable.totpURI).searchParams.get('secret') ?? ''
    await call(jar, 'POST', '/two-factor/verify-totp', { code: totpAt(secret, Date.now() - 30_000) })
    const codes = ((await (await call(jar, 'POST', '/recovery/issue', {})).json()) as { codes: string[] }).codes
    await pool.query(`delete from "session" where "userId" = $1`, [made.user.id])
    return { email, userId: made.user.id, secret, codes }
  }
  /** Password then authenticator code, optionally with the shared-computer cookie. Codes: steps t, then t+1. */
  async function signIn(u: { email: string; secret: string }, shared: boolean, step: number) {
    const jar = new Jar()
    if (shared) jar.set('__Host-portal.shared', '1')
    await call(jar, 'POST', '/sign-in/email', { email: u.email, password: PASSWORD })
    const done = await call(jar, 'POST', '/two-factor/verify-totp', { code: totpAt(u.secret, Date.now() + step * 30_000) })
    expect(done.status).toBe(200)
    return jar
  }
  const sessionIds = async (userId: string) => (await pool.query<{ id: string }>(`select "id" from "session" where "userId" = $1`, [userId])).rows.map((r) => r.id)
  const sharedRows = async (userId: string) =>
    (await pool.query(`select 1 from "session_shared" where "sessionId" in (select "id" from "session" where "userId" = $1)`, [userId])).rowCount
  const idle = (userId: string, minutes: number) =>
    pool.query(`update "session" set "updatedAt" = now() - make_interval(mins => $2) where "userId" = $1`, [userId, minutes])

  it('records the session as shared when the page asked, and not otherwise', async () => {
    const u = await user()
    await signIn(u, false, 0)
    expect(await sharedRows(u.userId)).toBe(0)
    await pool.query(`delete from "session" where "userId" = $1`, [u.userId])
    await signIn(u, true, 1)
    expect(await sharedRows(u.userId)).toBe(1)
    expect(await sessionIds(u.userId)).toHaveLength(1)
  })

  it('a shared session idle for 16 minutes is ended; a normal one is not', async () => {
    const u = await user()
    const shared = await signIn(u, true, 0)
    await idle(u.userId, 14)
    expect((await call(shared, 'GET', '/passkey/list-user-passkeys')).status).toBe(200)
    await idle(u.userId, 16)
    const res = await call(shared, 'GET', '/passkey/list-user-passkeys')
    expect(res.status).toBe(401)
    expect(await sessionIds(u.userId)).toHaveLength(0)

    const normal = await signIn(u, false, 1)
    await idle(u.userId, 16)
    expect((await call(normal, 'GET', '/passkey/list-user-passkeys')).status).toBe(200)
    await idle(u.userId, 31)
    expect((await call(normal, 'GET', '/passkey/list-user-passkeys')).status).toBe(401)
  })

  it('a failed sign-in with the cookie records nothing', async () => {
    const u = await user()
    const jar = new Jar()
    jar.set('__Host-portal.shared', '1')
    await call(jar, 'POST', '/sign-in/email', { email: u.email, password: PASSWORD })
    await call(jar, 'POST', '/two-factor/verify-totp', { code: '000000' })
    expect(await sharedRows(u.userId)).toBe(0)
  })

  it('the recovery sign-in honours the choice too', async () => {
    const u = await user()
    const jar = new Jar()
    jar.set('__Host-portal.shared', '1')
    const res = await call(jar, 'POST', '/recovery/sign-in', { email: u.email, password: PASSWORD, code: u.codes[0] })
    expect(res.status).toBe(200)
    expect(await sharedRows(u.userId)).toBe(1)
    const plain = new Jar()
    const res2 = await call(plain, 'POST', '/recovery/sign-in', { email: u.email, password: PASSWORD, code: u.codes[1] })
    expect(res2.status).toBe(200)
    expect(await sharedRows(u.userId)).toBe(0) // the second recovery ended every earlier session, and this one is not shared
  })

  it('deleting a session removes its flag', async () => {
    const u = await user()
    await signIn(u, true, 0)
    await pool.query(`delete from "session" where "userId" = $1`, [u.userId])
    expect((await pool.query(`select count(*)::int as n from "session_shared" where "sessionId" not in (select "id" from "session")`)).rows[0].n).toBe(0)
  })
})
