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
import { createPgRecoveryStore } from '@/modules/identity/recoveryStore'
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
    expect(first).toEqual(['0001_identity', '0002_session_assurance', '0003_recovery_attempt'])
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
    })
    email = `sample-${Date.now()}@example.test`
    const created = await auth.api.signUpEmail({ body: { email, password: PASSWORD, name: 'Sample Faculty' } })
    userId = created.user.id
  })

  afterAll(async () => {
    await closeIdentityPool()
  })

  class Jar {
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
        headers: { 'content-type': 'application/json', origin: ORIGIN, cookie: jar.header() },
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

  it('locks the account after five wrong codes: even a right code is refused, with the same answer', async () => {
    const { addr, jar } = await makeEnrolledUser('lock')
    const { codes } = await issue(jar)
    for (let i = 0; i < 5; i++) expect((await recoverySignIn(new Jar(), addr, 'AAAAA-AAAAA')).status).toBe(401)
    const locked = await recoverySignIn(new Jar(), addr, codes[0]!)
    expect(locked.status).toBe(401)
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
})
