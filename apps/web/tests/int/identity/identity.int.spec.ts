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
    expect(first).toEqual(['0001_identity'])
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
})
