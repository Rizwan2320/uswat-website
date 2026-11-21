// @vitest-environment node
/**
 * Identity module against the real library and a real PostgreSQL (local only).
 * Skipped unless IDENTITY_TEST_DATABASE_URL points at a throwaway database, because the first
 * test drops and recreates the `identity` schema in it.
 */
import { symmetricDecrypt } from 'better-auth/crypto'
import pg from 'pg'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { totpAt } from '../../helpers/totp'
import { readPortalConfig } from '@/modules/identity/config'
import { createPortalAuth, type PortalAuth } from '@/modules/identity/auth'
import { createPgStatusStore } from '@/modules/identity/accountStatus'
import { createPgAssuranceStore } from '@/modules/identity/assuranceStore'
import { createRecoveryService } from '@/modules/identity/recoveryService'
import { createPgAttemptStore, createPgRecoveryStore } from '@/modules/identity/recoveryStore'
import { createPgSessionStore } from '@/modules/identity/sessionStore'
import { purgeExpired } from '@/modules/identity/purge'
import { evaluateSession } from '@/modules/identity/sessionLifetime'
import { createPgSharedStore } from '@/modules/identity/sharedStore'
import { createPgAlertStore, createPgEventStore, EVENT_RETENTION_MS, FAILURE_COALESCE_MS, RECENT_LIMIT } from '@/modules/identity/securityEvents'
import { createSignInThrottle } from '@/modules/identity/signInThrottle'
import { createPgThrottleStore } from '@/modules/identity/signInThrottleStore'
import { closeIdentityPool, getIdentityPool } from '@/modules/identity/db'
import { loadFactors } from '@/modules/identity/factors'
import { createAuthHandlers, type AuthLike } from '@/modules/identity/handlers'
import { migrateDown, migrateUp } from '@/modules/identity/migrate'
import { portalDeps } from '@/modules/portal/deps'
import { EMPTY_EDIT, createSampleProfileStore } from '@/modules/portal/profile/sampleStore'
import type { ProfileEdit } from '@/modules/portal/profile/types'
import { buildCv } from '@/modules/portal/cv/build'
import { loadCvInput } from '@/modules/portal/cv/data'
import { createPgPublicationStore } from '@/modules/portal/publications/pgStore'
import type { Candidate } from '@/modules/portal/publications/types'
import { importCourses } from '@/modules/portal/courses/importer'
import { createPgCourseStore } from '@/modules/portal/courses/pgStore'
import { LIMITS as COURSE_LIMITS } from '@/modules/portal/courses/rules'
import type { CourseInput } from '@/modules/portal/courses/types'
import { createPgReviewStore } from '@/modules/portal/review/pgStore'
import { createPgActivationStore } from '@/modules/portal/activation/pgStore'
import { createClaimService } from '@/modules/identity/claimService'
import { createPgInvitationStore, hashToken, INVITATION_TTL_MS, type InvitationStore } from '@/modules/identity/invitations'
import { createPgRoleStore } from '@/modules/portal/review/roles'

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
    expect(first).toEqual(['0001_identity', '0002_session_assurance', '0003_recovery_attempt', '0004_signin_failure', '0005_step_up', '0006_session_shared', '0007_profile_draft', '0008_publication_candidate', '0009_course_taught', '0010_security_event', '0011_review_queue', '0012_claim_activation'])
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
      accountStatus: (id) => createPgStatusStore(pool).get(id),
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
      accountStatus: (id) => createPgStatusStore(pool).get(id),
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
      accountStatus: (id) => createPgStatusStore(pool).get(id),
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

describe.skipIf(!DB)('purge of expired identity rows (FP-10)', () => {
  let auth: PortalAuth
  let pool: pg.Pool
  let userId = ''
  let seq = 0
  const NOW = Date.now()
  const ago = (ms: number) => new Date(NOW - ms)

  beforeAll(async () => {
    const config = readPortalConfig(env)
    if (!config.enabled) throw new Error(`config: ${config.reason}`)
    auth = createPortalAuth(config)
    pool = getIdentityPool(config.databaseUrl)
    const made = await auth.api.signUpEmail({ body: { email: `purge-${Date.now()}@example.test`, password: PASSWORD, name: 'Sample Purge' } })
    userId = made.user.id
  })
  afterAll(async () => {
    await closeIdentityPool()
  })
  beforeEach(async () => {
    await pool.query(`delete from "session" where "userId" = $1`, [userId])
    await pool.query(`delete from "signin_failure"`)
    await pool.query(`delete from "recovery_attempt"`)
    await pool.query(`delete from "totp_replay"`)
    await pool.query(`delete from "verification"`)
  })

  /** A session with exact ages (ms before NOW); optionally shared and strong. Returns its id. */
  async function session(createdAgo: number, idleAgo: number, opts: { shared?: boolean; strong?: boolean } = {}) {
    const id = `purge-s-${++seq}-${Date.now()}`
    await pool.query(
      `insert into "session" ("id","expiresAt","token","createdAt","updatedAt","userId") values ($1, now() + interval '7 days', $2, $3, $4, $5)`,
      [id, `tok-${id}`, ago(createdAgo), ago(idleAgo), userId],
    )
    if (opts.shared) await pool.query(`insert into "session_shared" ("sessionId") values ($1)`, [id])
    if (opts.strong) await pool.query(`insert into "session_assurance" ("sessionId") values ($1)`, [id])
    return id
  }
  const exists = async (id: string) => ((await pool.query(`select 1 from "session" where "id" = $1`, [id])).rowCount ?? 0) === 1
  const count = async (table: string) => (await pool.query(`select count(*)::int as n from "${table}"`)).rows[0].n as number
  const MIN = 60_000

  it('sessions: kept just inside each limit, removed just past it', async () => {
    const keepIdle = await session(60 * MIN, 30 * MIN - 1000)
    const dropIdle = await session(60 * MIN, 30 * MIN + 1000)
    const keepShared = await session(60 * MIN, 15 * MIN - 1000, { shared: true })
    const dropShared = await session(60 * MIN, 15 * MIN + 1000, { shared: true })
    const keepAbs = await session(12 * 60 * MIN - 1000, 1000)
    const dropAbs = await session(12 * 60 * MIN + 1000, 1000)
    const counts = await purgeExpired(pool, NOW)
    expect(counts.sessions).toBe(3)
    expect(await exists(keepIdle)).toBe(true)
    expect(await exists(keepShared)).toBe(true)
    expect(await exists(keepAbs)).toBe(true)
    expect(await exists(dropIdle)).toBe(false)
    expect(await exists(dropShared)).toBe(false)
    expect(await exists(dropAbs)).toBe(false)
  })

  it('a shared session is held to 15 minutes; the same age unshared is still fine', async () => {
    const shared = await session(60 * MIN, 20 * MIN, { shared: true })
    const plain = await session(60 * MIN, 20 * MIN)
    await purgeExpired(pool, NOW)
    expect(await exists(shared)).toBe(false)
    expect(await exists(plain)).toBe(true)
  })

  it('removes the assurance and shared rows with the session, and leaves live ones alone', async () => {
    const dead = await session(60 * MIN, 40 * MIN, { shared: true, strong: true })
    const live = await session(60 * MIN, 1 * MIN, { strong: true })
    await purgeExpired(pool, NOW)
    expect((await pool.query(`select 1 from "session_assurance" where "sessionId" = $1`, [dead])).rowCount).toBe(0)
    expect((await pool.query(`select 1 from "session_shared" where "sessionId" = $1`, [dead])).rowCount).toBe(0)
    expect((await pool.query(`select 1 from "session_assurance" where "sessionId" = $1`, [live])).rowCount).toBe(1)
  })

  it('never removes a session the lifetime check would still accept, across many ages', async () => {
    const cases: { id: string; created: number; idle: number; shared: boolean }[] = []
    for (const shared of [false, true]) {
      for (const created of [5 * MIN, 60 * MIN, 11 * 60 * MIN, 12 * 60 * MIN - 1, 12 * 60 * MIN, 12 * 60 * MIN + 1, 20 * 60 * MIN]) {
        for (const idle of [0, 1, 14 * MIN, 15 * MIN - 1, 15 * MIN, 15 * MIN + 1, 29 * MIN, 30 * MIN - 1, 30 * MIN, 30 * MIN + 1, 3 * 60 * MIN]) {
          if (idle > created) continue
          cases.push({ id: await session(created, idle, { shared }), created, idle, shared })
        }
      }
    }
    await purgeExpired(pool, NOW)
    for (const c of cases) {
      const verdict = evaluateSession({ createdAt: ago(c.created), updatedAt: ago(c.idle), now: NOW, shared: c.shared })
      if (verdict === 'ok') expect(await exists(c.id), JSON.stringify(c)).toBe(true) // the one that must never fail
      else expect(await exists(c.id), JSON.stringify(c)).toBe(false)
    }
  })

  it('stale counters and marks go; fresh ones stay', async () => {
    await pool.query(`insert into "signin_failure" ("key","failures","lastFailureAt") values ('old', 5, $1), ('new', 5, $2)`, [ago(60 * MIN + 1000), ago(60 * MIN - 1000)])
    await pool.query(
      `insert into "recovery_attempt" ("userId","failures","windowStart") values ($1, 3, $2) on conflict ("userId") do update set "windowStart" = $2`,
      [userId, ago(15 * MIN + 1000)],
    )
    await pool.query(`insert into "totp_replay" ("key","usedAt") values ('old', $1), ('new', $2)`, [ago(120_000 + 1000), ago(120_000 - 1000)])
    await pool.query(`insert into "verification" ("id","identifier","value","expiresAt") values ('v1','x','y',$1), ('v2','x','y',$2)`, [ago(1000), new Date(NOW + 60_000)])
    const counts = await purgeExpired(pool, NOW)
    expect(counts).toMatchObject({ signInFailures: 1, recoveryAttempts: 1, totpReplays: 1, verifications: 1 })
    expect((await pool.query(`select "key" from "signin_failure"`)).rows).toEqual([{ key: 'new' }])
    expect((await pool.query(`select "key" from "totp_replay"`)).rows).toEqual([{ key: 'new' }])
    expect((await pool.query(`select "id" from "verification"`)).rows).toEqual([{ id: 'v2' }])
  })

  it('a recovery window just inside its 15 minutes is kept', async () => {
    await pool.query(
      `insert into "recovery_attempt" ("userId","failures","windowStart") values ($1, 5, $2) on conflict ("userId") do update set "failures" = 5, "windowStart" = $2`,
      [userId, ago(15 * MIN - 1000)],
    )
    expect((await purgeExpired(pool, NOW)).recoveryAttempts).toBe(0)
    expect(await count('recovery_attempt')).toBe(1)
  })

  it('a second run deletes nothing, and a dry run changes nothing but reports the same counts', async () => {
    await session(60 * MIN, 40 * MIN)
    await pool.query(`insert into "signin_failure" ("key","failures","lastFailureAt") values ('old', 5, $1)`, [ago(2 * 60 * MIN)])
    const dry = await purgeExpired(pool, NOW, { dryRun: true })
    expect(dry).toMatchObject({ sessions: 1, signInFailures: 1 })
    expect(await count('session')).toBeGreaterThanOrEqual(1)
    expect(await count('signin_failure')).toBe(1)
    const real = await purgeExpired(pool, NOW)
    expect(real).toEqual(dry)
    const again = await purgeExpired(pool, NOW)
    expect(Object.values(again).every((n) => n === 0)).toBe(true)
  })

  it('leaves users, accounts, passkeys, recovery codes and two-factor secrets alone', async () => {
    const before = await Promise.all(['user', 'account', 'passkey', 'recovery_code', 'twoFactor'].map(count))
    await session(20 * 60 * MIN, 19 * 60 * MIN)
    await purgeExpired(pool, NOW)
    expect(await Promise.all(['user', 'account', 'passkey', 'recovery_code', 'twoFactor'].map(count))).toEqual(before)
  })
})

describe.skipIf(!DB)('faculty profile draft store (FP-11), sample adapter on real PostgreSQL', () => {
  const pool = () => getIdentityPool(DB!)
  const store = () => createSampleProfileStore(pool())
  const edit = (over: Partial<ProfileEdit> = {}): ProfileEdit => ({ ...EMPTY_EDIT, bio: { en: 'Hello', ur: 'سلام' }, researchInterests: ['optics'], ...over })

  beforeAll(async () => {
    await migrateDown(DB!, {})
    await migrateUp(DB!, {})
  })
  afterAll(async () => {
    await closeIdentityPool()
  })

  async function account(tag: string): Promise<{ id: string; email: string }> {
    const id = `profile-${tag}-${Math.random().toString(36).slice(2, 8)}`
    const email = `${id}@example.invalid`
    await pool().query(`insert into "user" ("id","name","email","emailVerified") values ($1,$2,$3,true)`, [id, `Sample ${tag}`, email])
    return { id, email }
  }

  it('a new account loads a sample profile with nothing saved', async () => {
    const a = await account('new')
    const l = await store().load(a)
    expect(l.status).toBe('none')
    expect(l.updatedAt).toBeNull()
    expect(l.profile.sample).toBe(true)
    expect(l.profile.email).toBe(a.email)
    expect(l.profile.name.en).toBe('Sample new')
    expect(l.profile.visibility).toEqual({ email: 'hidden', photo: 'hidden' })
  })

  it('save then load round-trips every editable field, Urdu included', async () => {
    const a = await account('round')
    const e = edit({ orcid: '0000-0002-1825-0097', officeHours: 'Mon 10-12', visibility: { email: 'public', photo: 'internal' } })
    expect(await store().saveDraft(a.id, e)).toBe(true)
    const l = await store().load(a)
    expect(l.status).toBe('draft')
    expect(l.updatedAt).toBeGreaterThan(0)
    expect(l.profile.bio.ur).toBe('سلام')
    expect(l.profile).toMatchObject(e)
  })

  it('saving twice keeps one row per account and the later edit wins', async () => {
    const a = await account('twice')
    await store().saveDraft(a.id, edit({ officeLocation: 'first' }))
    await store().saveDraft(a.id, edit({ officeLocation: 'second' }))
    expect((await pool().query(`select count(*)::int as n from "profile_draft" where "userId" = $1`, [a.id])).rows[0].n).toBe(1)
    expect((await store().load(a)).profile.officeLocation).toBe('second')
  })

  it("one account's draft never appears in or changes another's", async () => {
    const a = await account('A')
    const b = await account('B')
    await store().saveDraft(a.id, edit({ officeLocation: 'A only' }))
    expect((await store().load(b)).profile.officeLocation).toBe('')
    expect((await store().load(b)).status).toBe('none')
    await store().saveDraft(b.id, edit({ officeLocation: 'B only' }))
    expect((await store().load(a)).profile.officeLocation).toBe('A only')
    expect(await store().submit(b.id)).toBe(true)
    expect((await store().load(a)).status).toBe('draft')
  })

  it('submit needs a draft, locks editing, and only withdraw reopens it', async () => {
    const a = await account('submit')
    expect(await store().submit(a.id)).toBe(false) // nothing to submit
    await store().saveDraft(a.id, edit({ officeLocation: 'kept' }))
    expect(await store().submit(a.id)).toBe(true)
    expect(await store().submit(a.id)).toBe(false) // already submitted
    expect(await store().saveDraft(a.id, edit({ officeLocation: 'sneaky' }))).toBe(false)
    const locked = await store().load(a)
    expect(locked.status).toBe('submitted')
    expect(locked.profile.officeLocation).toBe('kept')
    expect(await store().withdraw(a.id)).toBe(true)
    expect(await store().withdraw(a.id)).toBe(false) // not submitted any more
    expect(await store().saveDraft(a.id, edit({ officeLocation: 'changed' }))).toBe(true)
    expect((await store().load(a)).profile.officeLocation).toBe('changed')
  })

  it('withdraw does nothing for an account with no draft', async () => {
    expect(await store().withdraw((await account('nodraft')).id)).toBe(false)
  })

  it('the fixed fields come from the sample seed and cannot be changed by saving', async () => {
    const a = await account('fixed')
    // A stored edit that (wrongly) carried high-impact keys must not override them on load.
    await pool().query(`insert into "profile_draft" ("userId","edit","status") values ($1,$2,'draft')`, [a.id, JSON.stringify({ ...EMPTY_EDIT, designation: { en: 'Vice Chancellor', ur: '' }, department: 'Elsewhere', sample: false })])
    const l = await store().load(a)
    expect(l.profile.designation.en).toBe('Lecturer (sample)')
    expect(l.profile.department).toBe('Sample Department')
    expect(l.profile.sample).toBe(true)
  })

  it('deleting the account deletes its draft', async () => {
    const a = await account('cascade')
    await store().saveDraft(a.id, edit())
    await pool().query(`delete from "user" where "id" = $1`, [a.id])
    expect((await pool().query(`select count(*)::int as n from "profile_draft" where "userId" = $1`, [a.id])).rows[0].n).toBe(0)
  })

  it('the table refuses an unknown status and a draft for a missing account', async () => {
    const a = await account('check')
    await expect(pool().query(`insert into "profile_draft" ("userId","edit","status") values ($1,'{}','published')`, [a.id])).rejects.toThrow()
    await expect(pool().query(`insert into "profile_draft" ("userId","edit","status") values ('nobody','{}','draft')`)).rejects.toThrow()
  })
})

describe.skipIf(!DB)('publication candidates (FP-12, FPR-05), PostgreSQL store', () => {
  const pool = () => getIdentityPool(DB!)
  const store = () => createPgPublicationStore(pool())
  const work = (over: Partial<Candidate> = {}): Candidate => ({ title: 'Sample paper one', year: 2022, venue: 'Journal', doi: '10.5555/one', authors: ['A. Sample'], ...over })

  beforeAll(async () => {
    await migrateDown(DB!, {})
    await migrateUp(DB!, {})
  })
  afterAll(async () => {
    await closeIdentityPool()
  })

  async function account(tag: string): Promise<string> {
    const id = `pub-${tag}-${Math.random().toString(36).slice(2, 8)}`
    await pool().query(`insert into "user" ("id","name","email","emailVerified") values ($1,$2,$3,true)`, [id, `Sample ${tag}`, `${id}@example.invalid`])
    return id
  }
  const ids = async (a: string, status: 'pending' | 'claimed' | 'rejected' | 'duplicate') => (await store().list(a))[status].map((w) => w.id)

  it('harvesting the same works twice adds nothing the second time', async () => {
    const a = await account('twice')
    const works = [work(), work({ title: 'Sample paper two', doi: '' })]
    expect(await store().addCandidates(a, works, true)).toEqual({ added: 2, alreadyKnown: 0 })
    expect(await store().addCandidates(a, works, true)).toEqual({ added: 0, alreadyKnown: 2 })
    expect((await store().list(a)).pending).toHaveLength(2)
  })

  it('a no-DOI copy with the same title and year is one work, whichever arrives first', async () => {
    const a = await account('order1')
    await store().addCandidates(a, [work({ doi: '' }), work({ title: 'SAMPLE paper — one!', doi: '10.5555/one' })], true)
    expect((await store().list(a)).pending).toHaveLength(1)
    const b = await account('order2')
    await store().addCandidates(b, [work({ title: 'SAMPLE paper — one!', doi: '10.5555/one' }), work({ doi: '' })], true)
    expect((await store().list(b)).pending).toHaveLength(1)
  })

  it('the same DOI under a different title is one work; the same title in another year is two', async () => {
    const a = await account('keys')
    await store().addCandidates(a, [work(), work({ title: 'Completely different title' })], true)
    expect((await store().list(a)).pending).toHaveLength(1)
    await store().addCandidates(a, [work({ doi: '', year: 2023 })], true)
    expect((await store().list(a)).pending).toHaveLength(2)
  })

  it('a rejected work does not come back when harvested again (and neither does a claimed one)', async () => {
    const a = await account('reject')
    await store().addCandidates(a, [work(), work({ title: 'Two', doi: '10.5555/two' })], true)
    const [first, second] = (await store().list(a)).pending
    expect(await store().reject(a, first.id)).toBe(true)
    expect(await store().claim(a, second.id)).toBe(true)
    expect(await store().addCandidates(a, [work(), work({ title: 'Two', doi: '10.5555/two' })], true)).toEqual({ added: 0, alreadyKnown: 2 })
    expect((await store().list(a)).pending).toHaveLength(0)
    expect(await ids(a, 'rejected')).toEqual([first.id])
  })

  it('only a pending work can be claimed or rejected, once', async () => {
    const a = await account('once')
    await store().addCandidates(a, [work()], true)
    const [w] = (await store().list(a)).pending
    expect(await store().claim(a, w.id)).toBe(true)
    expect(await store().claim(a, w.id)).toBe(false)
    expect(await store().reject(a, w.id)).toBe(false)
    expect(await ids(a, 'claimed')).toEqual([w.id])
  })

  it('duplicate needs a claimed target of the same account, and not the work itself', async () => {
    const a = await account('dup')
    await store().addCandidates(a, [work(), work({ title: 'Two', doi: '10.5555/two' }), work({ title: 'Three', doi: '10.5555/three' })], true)
    const [x, y, z] = (await store().list(a)).pending
    expect(await store().markDuplicate(a, y.id, x.id)).toBe(false) // target still pending
    expect(await store().claim(a, x.id)).toBe(true)
    expect(await store().markDuplicate(a, x.id, x.id)).toBe(false) // itself
    expect(await store().markDuplicate(a, y.id, x.id)).toBe(true)
    expect(await store().markDuplicate(a, y.id, x.id)).toBe(false) // no longer pending
    expect(await store().reject(a, z.id)).toBe(true)
    expect(await store().markDuplicate(a, z.id, x.id)).toBe(false) // rejected, not pending
    const listed = (await store().list(a)).duplicate
    expect(listed.map((d) => [d.id, d.duplicateOf])).toEqual([[y.id, x.id]])
  })

  it("one account cannot see or decide another's works, or point a duplicate at another's claim", async () => {
    const a = await account('A')
    const b = await account('B')
    await store().addCandidates(a, [work()], true)
    await store().addCandidates(b, [work({ title: 'Mine', doi: '10.5555/mine' })], true)
    const [aw] = (await store().list(a)).pending
    const [bw] = (await store().list(b)).pending
    expect(await store().claim(b, aw.id)).toBe(false)
    expect(await store().reject(b, aw.id)).toBe(false)
    expect((await store().list(b)).pending.map((w) => w.id)).toEqual([bw.id])
    expect(await store().claim(a, aw.id)).toBe(true)
    expect(await store().markDuplicate(b, bw.id, aw.id)).toBe(false)
    expect(await ids(a, 'pending')).toEqual([])
    expect(await ids(b, 'pending')).toEqual([bw.id])
  })

  it('the same work can belong to two different accounts', async () => {
    const a = await account('shareA')
    const b = await account('shareB')
    expect((await store().addCandidates(a, [work()], true)).added).toBe(1)
    expect((await store().addCandidates(b, [work()], true)).added).toBe(1)
  })

  it('keeps Urdu text and the sample flag, and lists newest year first', async () => {
    const a = await account('urdu')
    await store().addCandidates(a, [work({ title: 'نمونہ مقالہ', doi: '', year: 2023, authors: ['اے نمونہ'] }), work({ year: 2019, title: 'Older', doi: '' })], true)
    const { pending } = await store().list(a)
    expect(pending.map((w) => w.year)).toEqual([2023, 2019])
    expect(pending[0]).toMatchObject({ title: 'نمونہ مقالہ', authors: ['اے نمونہ'], sample: true, doi: '' })
  })

  it('a failed batch stores nothing (one transaction)', async () => {
    const a = await account('atomic')
    await expect(store().addCandidates(a, [work(), { ...work({ title: 'Bad', doi: '' }), year: 'x' as unknown as number }], true)).rejects.toThrow()
    expect((await store().list(a)).pending).toHaveLength(0)
  })

  it('deleting the account deletes its works; the table refuses an unknown status', async () => {
    const a = await account('cascade')
    await store().addCandidates(a, [work()], true)
    await expect(pool().query(`update "publication_candidate" set "status" = 'published' where "userId" = $1`, [a])).rejects.toThrow()
    await pool().query(`delete from "user" where "id" = $1`, [a])
    expect((await pool().query(`select count(*)::int as n from "publication_candidate" where "userId" = $1`, [a])).rows[0].n).toBe(0)
  })
})

describe.skipIf(!DB)('courses taught (FP-30), PostgreSQL store', () => {
  const pool = () => getIdentityPool(DB!)
  const store = () => createPgCourseStore(pool())
  const course = (over: Partial<CourseInput> = {}): CourseInput => ({ code: 'SAM 101', title: 'Sample Course', season: 'Fall', year: 2026, programme: 'Sample Programme', ...over })

  beforeAll(async () => {
    await migrateDown(DB!, {})
    await migrateUp(DB!, {})
  })
  afterAll(async () => {
    await closeIdentityPool()
  })

  async function account(tag: string): Promise<string> {
    const id = `course-${tag}-${Math.random().toString(36).slice(2, 8)}`
    await pool().query(`insert into "user" ("id","name","email","emailVerified") values ($1,$2,$3,true)`, [id, `Sample ${tag}`, `${id}@example.invalid`])
    return id
  }

  it('add then list round-trips, Urdu title included', async () => {
    const a = await account('rt')
    expect(await store().add(a, course({ title: 'نمونہ کورس' }))).toBe('added')
    const [c] = await store().list(a)
    expect(c).toMatchObject({ code: 'SAM 101', title: 'نمونہ کورس', season: 'Fall', year: 2026, programme: 'Sample Programme', source: 'manual' })
  })

  it('lists newest semester first (Winter, Fall, Summer, Spring within a year), then by code', async () => {
    const a = await account('order')
    for (const c of [course({ code: 'B', season: 'Spring', year: 2025 }), course({ code: 'A', season: 'Spring', year: 2026 }), course({ code: 'C', season: 'Winter', year: 2025 }), course({ code: 'D', season: 'Fall', year: 2026 }), course({ code: 'AB', season: 'Fall', year: 2026 }), course({ code: 'E', season: 'Summer', year: 2026 })])
      await store().add(a, { ...c, code: c.code + ' 1' })
    expect((await store().list(a)).map((c) => `${c.season}${c.year} ${c.code}`)).toEqual(['Fall2026 AB 1', 'Fall2026 D 1', 'Summer2026 E 1', 'Spring2026 A 1', 'Winter2025 C 1', 'Spring2025 B 1'])
  })

  it('the same code in the same semester is a duplicate; another semester or code is fine', async () => {
    const a = await account('dup')
    expect(await store().add(a, course())).toBe('added')
    expect(await store().add(a, course({ title: 'Other title' }))).toBe('duplicate')
    expect(await store().add(a, course({ season: 'Spring' }))).toBe('added')
    expect(await store().add(a, course({ code: 'SAM 102' }))).toBe('added')
    expect(await store().list(a)).toHaveLength(3)
  })

  it('stops at the limit, and two simultaneous adds at the edge cannot both get in', async () => {
    const a = await account('limit')
    for (let i = 0; i < COURSE_LIMITS.perAccount - 1; i++) await store().add(a, course({ code: `L ${i}` }))
    const results = await Promise.all([store().add(a, course({ code: 'X 1' })), store().add(a, course({ code: 'X 2' })), store().add(a, course({ code: 'X 3' }))])
    expect(results.filter((r) => r === 'added')).toHaveLength(1)
    expect(results.filter((r) => r === 'limit')).toHaveLength(2)
    expect(await store().list(a)).toHaveLength(COURSE_LIMITS.perAccount)
    // Removing one makes room again.
    const [first] = await store().list(a)
    expect(await store().remove(a, first.id)).toBe(true)
    expect(await store().add(a, course({ code: 'X 4' }))).toBe('added')
  })

  it("one account cannot list or remove another's courses; the same course can belong to two accounts", async () => {
    const a = await account('A')
    const b = await account('B')
    await store().add(a, course())
    expect(await store().add(b, course())).toBe('added')
    const [ac] = await store().list(a)
    expect(await store().remove(b, ac.id)).toBe(false)
    expect(await store().list(a)).toHaveLength(1)
    expect((await store().list(b)).map((c) => c.id)).not.toContain(ac.id)
    expect(await store().remove(a, ac.id)).toBe(true)
    expect(await store().remove(a, ac.id)).toBe(false)
  })

  it('an imported course cannot be removed by hand', async () => {
    const a = await account('feed')
    await pool().query(`insert into "course_taught" ("userId","code","title","season","year","source") values ($1,'IMP 1','Imported','Fall',2026,'import')`, [a])
    const [c] = await store().list(a)
    expect(c.source).toBe('import')
    expect(await store().remove(a, c.id)).toBe(false)
    expect(await store().list(a)).toHaveLength(1)
  })

  it('deleting the account deletes its courses; the table refuses a bad season, a bad year and an unknown source', async () => {
    const a = await account('check')
    await store().add(a, course())
    for (const [season, year, source] of [['Autumn', 2026, 'manual'], ['Fall', 1999, 'manual'], ['Fall', 2026, 'other']])
      await expect(pool().query(`insert into "course_taught" ("userId","code","title","season","year","source") values ($1,'Z 1','t',$2,$3,$4)`, [a, season, year, source])).rejects.toThrow()
    await pool().query(`delete from "user" where "id" = $1`, [a])
    expect((await pool().query(`select count(*)::int as n from "course_taught" where "userId" = $1`, [a])).rows[0].n).toBe(0)
  })
})

describe.skipIf(!DB)('course import from a file (FP-30), PostgreSQL', () => {
  const pool = () => getIdentityPool(DB!)
  const NOW = Date.UTC(2026, 10, 19)
  const tag = Math.random().toString(36).slice(2, 7)

  beforeAll(async () => {
    await migrateDown(DB!, {})
    await migrateUp(DB!, {})
  })
  afterAll(async () => {
    await closeIdentityPool()
  })

  async function account(name: string): Promise<{ id: string; email: string }> {
    const id = `imp-${name}-${tag}`
    const email = `${id}@example.invalid`
    await pool().query(`insert into "user" ("id","name","email","emailVerified") values ($1,$2,$3,true)`, [id, `Sample ${name}`, email])
    return { id, email }
  }
  const row = (email: string, over: Record<string, unknown> = {}) => ({ email, code: 'IMP 1', title: 'Imported course', season: 'Fall', year: 2026, programme: 'Sample Programme', ...over })
  const count = async (id: string) => (await pool().query(`select count(*)::int as n from "course_taught" where "userId" = $1`, [id])).rows[0].n as number

  it('loads good rows, reports the repeat and the three bad rows, and leaves the rest of the file loaded', async () => {
    const a = await account('a')
    const b = await account('b')
    const rows = [
      row(a.email, { code: 'IMP 1' }),
      row(a.email, { code: 'IMP 2' }),
      row(a.email, { code: 'IMP 1' }), // repeat of the first
      row(a.email, { code: 'x' }), // bad code
      row(`nobody-${tag}@example.invalid`), // no such account
      row(b.email, { title: 'نمونہ درآمد شدہ کورس' }),
      row(b.email, { code: 'IMP 3', phone: '123' }), // extra key
      'not an object',
    ]
    const report = await importCourses(pool(), rows, NOW)
    expect(report).toMatchObject({ added: 3, duplicate: 1, limit: 0, dryRun: false })
    expect(report.rejected.map((r) => [r.row, r.reason])).toEqual([[4, 'invalid'], [5, 'unknown-account'], [7, 'unknown-key'], [8, 'bad-row']])
    expect(await count(a.id)).toBe(2)
    const urdu = (await createPgCourseStore(pool()).list(b.id))[0]
    expect(urdu).toMatchObject({ title: 'نمونہ درآمد شدہ کورس', source: 'import' })
  })

  it('running the same file again adds nothing (every row is a repeat)', async () => {
    const a = await account('again')
    const rows = [row(a.email, { code: 'R 1' }), row(a.email, { code: 'R 2' })]
    expect((await importCourses(pool(), rows, NOW)).added).toBe(2)
    expect(await importCourses(pool(), rows, NOW)).toMatchObject({ added: 0, duplicate: 2 })
    expect(await count(a.id)).toBe(2)
  })

  it('a dry run counts like a real run but leaves nothing behind and holds no lock', async () => {
    const a = await account('dry')
    const rows = [row(a.email, { code: 'D 1' }), row(a.email, { code: 'D 2' })]
    expect(await importCourses(pool(), rows, NOW, { dryRun: true })).toMatchObject({ added: 2, dryRun: true })
    expect(await count(a.id)).toBe(0)
    // A real add straight afterwards must not wait on a lock left behind.
    expect(await createPgCourseStore(pool()).add(a.id, { code: 'D 3', title: 't', season: 'Fall', year: 2026, programme: '' })).toBe('added')
  })

  it('matches the account email ignoring case and spaces, and never touches another account', async () => {
    const a = await account('case')
    const b = await account('other')
    const r = await importCourses(pool(), [row(`  ${a.email.toUpperCase()} `, { code: 'C 1' })], NOW)
    expect(r.added).toBe(1)
    expect(await count(a.id)).toBe(1)
    expect(await count(b.id)).toBe(0)
  })

  it('imported courses count toward the limit of 60 and the rest are reported as limit', async () => {
    const a = await account('limit')
    const rows = Array.from({ length: 63 }, (_, i) => row(a.email, { code: `L ${i}` }))
    expect(await importCourses(pool(), rows, NOW)).toMatchObject({ added: 60, limit: 3 })
    expect(await count(a.id)).toBe(60)
  })

  it('imported courses cannot be removed by hand, typed ones still can', async () => {
    const a = await account('rm')
    await importCourses(pool(), [row(a.email, { code: 'RM 1' })], NOW)
    const store = createPgCourseStore(pool())
    await store.add(a.id, { code: 'RM 2', title: 't', season: 'Fall', year: 2026, programme: '' })
    const list = await store.list(a.id)
    const imported = list.find((c) => c.source === 'import')!
    const typed = list.find((c) => c.source === 'manual')!
    expect(await store.remove(a.id, imported.id)).toBe(false)
    expect(await store.remove(a.id, typed.id)).toBe(true)
  })

  it('refuses a non-array and a file with too many rows, and writes nothing', async () => {
    await expect(importCourses(pool(), { not: 'an array' }, NOW)).rejects.toThrow()
    await expect(importCourses(pool(), new Array(5001).fill({}), NOW)).rejects.toThrow()
  })

  it('a database failure part-way rolls the whole file back', async () => {
    const a = await account('fail')
    await pool().query(`alter table "course_taught" add constraint "tmp_fail_check" check ("code" <> 'BOOM 1')`)
    try {
      await expect(importCourses(pool(), [row(a.email, { code: 'OK 1' }), row(a.email, { code: 'BOOM 1' })], NOW)).rejects.toThrow()
      expect(await count(a.id)).toBe(0)
    } finally {
      await pool().query(`alter table "course_taught" drop constraint "tmp_fail_check"`)
    }
  })

  it('the shipped sample file passes every rule: all rows load for matching accounts, the repeat-looking row is a different semester', async () => {
    const fs = await import('node:fs')
    const sample = JSON.parse(fs.readFileSync(new URL('../../../scripts/sample-data/courses.sample.json', import.meta.url), 'utf8')) as Array<{ email: string }>
    const emails = [...new Set(sample.map((r) => r.email))]
    for (const [i, e] of emails.entries()) await pool().query(`insert into "user" ("id","name","email","emailVerified") values ($1,$2,$3,true) on conflict do nothing`, [`samplefile-${i}-${tag}`, `Sample ${i}`, e])
    const report = await importCourses(pool(), sample, NOW, { dryRun: true })
    expect(report).toMatchObject({ added: sample.length, duplicate: 0, limit: 0, rejected: [] })
    await pool().query(`delete from "user" where "id" like $1`, [`samplefile-%-${tag}`])
  })
})

describe.skipIf(!DB)('security centre (FP-51, PJ8), PostgreSQL and the real library', () => {
  let auth: PortalAuth
  let h: ReturnType<typeof createAuthHandlers>
  let pool: pg.Pool
  let seq = 0
  const MIN = 60_000

  beforeAll(async () => {
    await migrateDown(DB!, {})
    await migrateUp(DB!, {})
    const config = readPortalConfig(env)
    if (!config.enabled) throw new Error(`config: ${config.reason}`)
    // portalDeps reads these when called; the real recordSignInFailure is what the app uses.
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v as string)
    auth = createPortalAuth(config)
    pool = getIdentityPool(config.databaseUrl)
    h = createAuthHandlers({
      env,
      getAuth: () => auth as unknown as AuthLike,
      loadFactors: (id) => loadFactors(pool, id),
      isStrongSession: (id) => createPgAssuranceStore(pool).isStrong(id),
      accountStatus: (id) => createPgStatusStore(pool).get(id),
      lastVerifiedAt: (id) => createPgAssuranceStore(pool).lastVerifiedAt(id),
      endSession: (id) => createPgSessionStore(pool).end(id),
      touchSession: (id, now) => createPgSessionStore(pool).touch(id, now),
      signInThrottle: createSignInThrottle({ store: createPgThrottleStore(pool) }),
      recordSignInFailure: portalDeps.recordSignInFailure,
    })
  })
  afterAll(async () => {
    vi.unstubAllEnvs()
    await closeIdentityPool()
  })

  class Jar {
    readonly ip = `198.20.${Math.floor(++seq / 250)}.${(seq % 250) + 1}`
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
  const prefixOf = (jar: Jar) => `${jar.ip.split('.').slice(0, 3).join('.')}.0/24`

  /** A user with a confirmed authenticator app and one strong session (jar). `secret` makes more sessions. */
  async function userWithTotp(label = 'sec') {
    const email = `${label}-${Date.now()}-${++seq}@example.test`
    const made = await auth.api.signUpEmail({ body: { email, password: PASSWORD, name: 'Sample Security' } })
    await pool.query(`delete from "session" where "userId" = $1`, [made.user.id])
    const jar = new Jar()
    await call(jar, 'POST', '/sign-in/email', { email, password: PASSWORD })
    const enable = (await (await call(jar, 'POST', '/two-factor/enable', { password: PASSWORD })).json()) as { totpURI: string }
    const secret = new URL(enable.totpURI).searchParams.get('secret') ?? ''
    expect((await call(jar, 'POST', '/two-factor/verify-totp', { code: totpAt(secret, Date.now() - 30_000) })).status).toBe(200)
    return { email, userId: made.user.id, secret, jar }
  }
  /** A second strong session for the same account (a different "device"), using the current TOTP window. */
  async function secondDevice(u: { email: string; secret: string }) {
    const jar = new Jar()
    await call(jar, 'POST', '/sign-in/email', { email: u.email, password: PASSWORD })
    expect((await call(jar, 'POST', '/two-factor/verify-totp', { code: totpAt(u.secret, Date.now()) })).status).toBe(200)
    return jar
  }
  const events = (userId: string) => createPgEventStore(pool).recent(userId)
  const types = async (userId: string) => (await events(userId)).map((e) => `${e.type}:${e.outcome}`)
  const alive = async (jar: Jar) => (await call(jar, 'GET', '/get-session')).status === 200
  const rowCount = async (table: string, userId: string) => (await pool.query(`select count(*)::int as n from "${table}" where "userId" = $1`, [userId])).rows[0].n as number

  async function twoUsers() {
    const a = await userWithTotp('a')
    const b = await userWithTotp('b')
    return { a, b }
  }

  describe('the event store', () => {
    it('returns the last 50, newest first, for the asked account only', async () => {
      const { a, b } = await twoUsers()
      const store = createPgEventStore(pool)
      await pool.query(`delete from "security_event" where "userId" in ($1,$2)`, [a.userId, b.userId])
      const base = Date.now() - 100 * MIN
      for (let i = 0; i < 60; i++) await store.record({ userId: a.userId, type: 'sign-in-passkey', outcome: 'success', ipPrefix: `10.0.${i}.0/24` }, base + i * 1000)
      for (let i = 0; i < 3; i++) await store.record({ userId: b.userId, type: 'sign-in-passkey', outcome: 'success', ipPrefix: '192.0.2.0/24' }, base + i * 1000)
      const rows = await store.recent(a.userId)
      expect(rows).toHaveLength(RECENT_LIMIT)
      expect(rows[0]!.ipPrefix).toBe('10.0.59.0/24')
      expect(rows[49]!.ipPrefix).toBe('10.0.10.0/24')
      for (let i = 1; i < rows.length; i++) expect(rows[i - 1]!.at.getTime()).toBeGreaterThan(rows[i]!.at.getTime())
      expect(rows.some((r) => r.ipPrefix === '192.0.2.0/24')).toBe(false)
      expect(await store.recent(b.userId)).toHaveLength(3)
      expect(await store.recent(a.userId, 5)).toHaveLength(5)
      expect(await store.recent(a.userId, 500)).toHaveLength(RECENT_LIMIT)
      expect(await store.recent(a.userId, -3)).toHaveLength(1)
      expect(await store.recent('nobody')).toEqual([])
    })

    it('records a failed password attempt at most once in ten minutes per account; other types and other accounts are not held back', async () => {
      const { a, b } = await twoUsers()
      const store = createPgEventStore(pool)
      await pool.query(`delete from "security_event" where "userId" in ($1,$2)`, [a.userId, b.userId])
      const t0 = Date.now()
      const fail = (u: string, at: number) => store.record({ userId: u, type: 'sign-in-failed', outcome: 'failure', ipPrefix: null }, at)
      await fail(a.userId, t0)
      await fail(a.userId, t0 + FAILURE_COALESCE_MS - 1)
      expect(await rowCount('security_event', a.userId)).toBe(1)
      await fail(a.userId, t0 + FAILURE_COALESCE_MS)
      expect(await rowCount('security_event', a.userId)).toBe(2)
      await fail(b.userId, t0 + 1)
      expect(await rowCount('security_event', b.userId)).toBe(1)
      await store.record({ userId: a.userId, type: 'sign-in-passkey', outcome: 'success', ipPrefix: null }, t0 + FAILURE_COALESCE_MS + 1)
      expect(await rowCount('security_event', a.userId)).toBe(3)
    })

    it('the database refuses an unknown type or outcome and an over-long prefix; the store refuses an unknown type', async () => {
      const { a } = await twoUsers()
      const raw = (type: string, outcome: string, prefix: string | null) =>
        pool.query(`insert into "security_event" ("userId","type","outcome","ipPrefix") values ($1,$2,$3,$4)`, [a.userId, type, outcome, prefix])
      await expect(raw('made-up', 'success', null)).rejects.toThrow()
      await expect(raw('not-me', 'maybe', null)).rejects.toThrow()
      await expect(raw('not-me', 'success', 'x'.repeat(46))).rejects.toThrow()
      await expect(raw('not-me', 'success', null)).resolves.toBeDefined()
      await expect(createPgEventStore(pool).record({ userId: a.userId, type: 'made-up' as never, outcome: 'success', ipPrefix: null }, Date.now())).rejects.toThrow()
    })

    it('events and alerts go with the account', async () => {
      const { a } = await twoUsers()
      await createPgEventStore(pool).record({ userId: a.userId, type: 'not-me', outcome: 'success', ipPrefix: null }, Date.now())
      await createPgAlertStore(pool).raise(a.userId, null, Date.now())
      expect(await rowCount('security_event', a.userId)).toBeGreaterThan(0)
      await pool.query(`delete from "user" where "id" = $1`, [a.userId])
      expect(await rowCount('security_event', a.userId)).toBe(0)
      expect(await rowCount('security_alert', a.userId)).toBe(0)
    })
  })

  describe('events recorded by the real library', () => {
    it('password accepted and authenticator confirmed are logged with the network prefix, never the full address', async () => {
      const u = await userWithTotp('ev')
      const got = await events(u.userId)
      expect(got.map((e) => e.type).sort()).toEqual(['sign-in-authenticator', 'sign-in-password'])
      for (const e of got) {
        expect(e.outcome).toBe('success')
        expect(e.ipPrefix).toBe(prefixOf(u.jar))
      }
      const all = (await pool.query<{ p: string | null }>(`select "ipPrefix" as p from "security_event"`)).rows.map((r) => r.p)
      for (const p of all) expect(p === null || /^\d+\.\d+\.\d+\.0\/24$|::\/48$/.test(p)).toBe(true)
    })

    it('the session row carries the same address header as the log, so the sessions list and the log agree', async () => {
      const u = await userWithTotp('ip')
      const rows = (await pool.query<{ ipAddress: string | null }>(`select "ipAddress" from "session" where "userId" = $1`, [u.userId])).rows
      expect(rows).toHaveLength(1)
      expect(rows[0]!.ipAddress).toBe(u.jar.ip)
      expect(prefixOf(u.jar)).toBe((await events(u.userId))[0]!.ipPrefix)
    })

    it('a second device signing in with the authenticator is logged as such', async () => {
      const u = await userWithTotp('ev2')
      await secondDevice(u)
      const t = await types(u.userId)
      expect(t.filter((x) => x === 'sign-in-authenticator:success')).toHaveLength(2)
      // Only the first password sign-in made a session (before the authenticator was added). Afterwards a
      // password alone makes no session, so it is not a sign-in event: the authenticator step is.
      expect(t.filter((x) => x === 'sign-in-password:success')).toHaveLength(1)
    })

    it('issuing recovery codes and signing in with one are logged', async () => {
      const u = await userWithTotp('ev3')
      const issued = await call(u.jar, 'POST', '/recovery/issue', {})
      expect(issued.status).toBe(200)
      const code = ((await issued.json()) as { codes: string[] }).codes[0]!
      const fresh = new Jar()
      expect((await call(fresh, 'POST', '/recovery/sign-in', { email: u.email, password: PASSWORD, code })).status).toBe(200)
      const t = await types(u.userId)
      expect(t).toContain('recovery-codes-issued:success')
      expect(t).toContain('sign-in-recovery:success')
    })

    it('a wrong password is logged as a failure once per ten minutes for a known account, and not at all for an unknown address', async () => {
      const u = await userWithTotp('ev4')
      const before = (await pool.query(`select count(*)::int as n from "security_event"`)).rows[0].n as number
      const j = new Jar()
      expect((await call(j, 'POST', '/sign-in/email', { email: u.email, password: 'wrong wrong wrong wrong' })).status).toBe(401)
      const j2 = new Jar()
      expect((await call(j2, 'POST', '/sign-in/email', { email: u.email.toUpperCase(), password: 'wrong again wrong again' })).status).toBe(401)
      const failures = (await events(u.userId)).filter((e) => e.type === 'sign-in-failed')
      expect(failures).toHaveLength(1)
      expect(failures[0]).toMatchObject({ outcome: 'failure', ipPrefix: prefixOf(j) })
      const mid = (await pool.query(`select count(*)::int as n from "security_event"`)).rows[0].n as number
      expect(mid).toBe(before + 1)
      expect((await call(new Jar(), 'POST', '/sign-in/email', { email: `nobody-${Date.now()}@example.test`, password: 'wrong wrong wrong wrong' })).status).toBe(401)
      expect((await pool.query(`select count(*)::int as n from "security_event"`)).rows[0].n).toBe(mid)
    })
  })

  describe('Sign out everywhere', () => {
    it('ends every session of this account, including the one that asked, and nobody else’s', async () => {
      const { a, b } = await twoUsers()
      const phone = await secondDevice(a)
      expect(await alive(a.jar)).toBe(true)
      expect(await alive(phone)).toBe(true)
      const res = await call(a.jar, 'POST', '/security/sign-out-everywhere', {})
      expect(res.status).toBe(200)
      expect(res.headers.get('cache-control')).toBe('no-store')
      expect(a.jar.header()).not.toContain('session_token')
      expect(await alive(phone)).toBe(false)
      expect(await rowCount('session', a.userId)).toBe(0)
      expect(await alive(b.jar)).toBe(true)
      expect(await rowCount('session', b.userId)).toBe(1)
      expect(await types(a.userId)).toContain('sign-out-everywhere:success')
      expect(await rowCount('security_alert', a.userId)).toBe(0)
    })

    it('is refused without a session, and for a session with no second factor', async () => {
      expect((await call(new Jar(), 'POST', '/security/sign-out-everywhere', {})).status).toBe(401)
      const weak = `weak-${Date.now()}@example.test`
      await auth.api.signUpEmail({ body: { email: weak, password: PASSWORD, name: 'Sample Weak' } })
      const j = new Jar()
      await call(j, 'POST', '/sign-in/email', { email: weak, password: PASSWORD })
      expect((await call(j, 'POST', '/security/sign-out-everywhere', {})).status).toBe(403)
    })
  })

  describe('PJ8: This wasn’t me', () => {
    it('ends every session of this account, raises one alert, logs it, and touches nobody else', async () => {
      const { a, b } = await twoUsers()
      const phone = await secondDevice(a)
      const res = await call(a.jar, 'POST', '/security/not-me', {})
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ ok: true, alerted: true })
      expect(await alive(phone)).toBe(false)
      expect(await rowCount('session', a.userId)).toBe(0)
      expect(await alive(b.jar)).toBe(true)
      expect(await types(a.userId)).toContain('not-me:success')
      const open = await createPgAlertStore(pool).listOpen()
      const mine = open.filter((x) => x.userId === a.userId)
      expect(mine).toHaveLength(1)
      expect(mine[0]).toMatchObject({ email: a.email, ipPrefix: prefixOf(a.jar) })
      expect(open.some((x) => x.userId === b.userId)).toBe(false)
    })

    it('is refused without a session or with a password-only session, and then raises nothing', async () => {
      const before = (await createPgAlertStore(pool).listOpen()).length
      expect((await call(new Jar(), 'POST', '/security/not-me', {})).status).toBe(401)
      const weak = `weak2-${Date.now()}@example.test`
      await auth.api.signUpEmail({ body: { email: weak, password: PASSWORD, name: 'Sample Weak' } })
      const j = new Jar()
      await call(j, 'POST', '/sign-in/email', { email: weak, password: PASSWORD })
      expect((await call(j, 'POST', '/security/not-me', {})).status).toBe(403)
      expect((await createPgAlertStore(pool).listOpen()).length).toBe(before)
    })

    it('the same account can raise it again after signing back in, and each press is its own alert', async () => {
      const a = await userWithTotp('again')
      expect((await call(a.jar, 'POST', '/security/not-me', {})).status).toBe(200)
      const back = await secondDevice({ email: a.email, secret: a.secret })
      expect((await call(back, 'POST', '/security/not-me', {})).status).toBe(200)
      expect(await rowCount('security_alert', a.userId)).toBe(2)
    })
  })

  describe('the alert queue', () => {
    it('lists open alerts oldest first, acknowledges each once, and ignores a malformed or unknown id', async () => {
      const a = await userWithTotp('q')
      const store = createPgAlertStore(pool)
      const id1 = await store.raise(a.userId, '203.0.113.0/24', Date.now() - 2 * MIN)
      const id2 = await store.raise(a.userId, null, Date.now() - MIN)
      const open = (await store.listOpen()).filter((x) => x.userId === a.userId).map((x) => x.id)
      expect(open).toEqual([id1, id2])
      expect(await store.acknowledge(id1, Date.now())).toBe(true)
      expect(await store.acknowledge(id1, Date.now())).toBe(false)
      expect((await store.listOpen()).filter((x) => x.userId === a.userId).map((x) => x.id)).toEqual([id2])
      expect(await store.acknowledge('not-a-uuid', Date.now())).toBe(false)
      expect(await store.acknowledge('00000000-0000-0000-0000-000000000000', Date.now())).toBe(false)
      expect(await store.acknowledge("x'; drop table security_alert; --", Date.now())).toBe(false)
      expect((await pool.query(`select count(*)::int as n from "security_alert"`)).rows[0].n).toBeGreaterThan(0)
    })

    it('the database ties the status to the acknowledgement time', async () => {
      const a = await userWithTotp('q2')
      await expect(pool.query(`insert into "security_alert" ("userId","reason","status") values ($1,'not-me','acknowledged')`, [a.userId])).rejects.toThrow()
      await expect(pool.query(`insert into "security_alert" ("userId","reason") values ($1,'something-else')`, [a.userId])).rejects.toThrow()
    })
  })

  describe('purge', () => {
    it('removes events past the retention and keeps those just inside it; alerts are never purged', async () => {
      const a = await userWithTotp('p')
      const NOW = Date.now()
      await pool.query(`delete from "security_event" where "userId" = $1`, [a.userId])
      const store = createPgEventStore(pool)
      await store.record({ userId: a.userId, type: 'not-me', outcome: 'success', ipPrefix: null }, NOW - EVENT_RETENTION_MS - 1000)
      await store.record({ userId: a.userId, type: 'sign-in-passkey', outcome: 'success', ipPrefix: null }, NOW - EVENT_RETENTION_MS + 1000)
      await createPgAlertStore(pool).raise(a.userId, null, NOW - EVENT_RETENTION_MS - 1000)
      const dry = await purgeExpired(pool, NOW, { dryRun: true })
      expect(dry.securityEvents).toBeGreaterThanOrEqual(1)
      expect(await rowCount('security_event', a.userId)).toBe(2)
      const counts = await purgeExpired(pool, NOW)
      expect(counts.securityEvents).toBe(dry.securityEvents)
      expect(await types(a.userId)).toEqual(['sign-in-passkey:success'])
      expect(await rowCount('security_alert', a.userId)).toBe(1)
    })
  })
})

describe.skipIf(!DB)('CV data for one account (FP-20), PostgreSQL', () => {
  const pool = () => getIdentityPool(DB!)
  const NOW = Date.UTC(2026, 10, 19)
  const tag = Math.random().toString(36).slice(2, 7)

  beforeAll(async () => {
    await migrateDown(DB!, {})
    await migrateUp(DB!, {})
  })
  afterAll(async () => {
    await closeIdentityPool()
  })

  async function account(name: string): Promise<{ id: string; email: string }> {
    const id = `cv-${name}-${tag}`
    const email = `${id}@example.invalid`
    await pool().query(`insert into "user" ("id","name","email","emailVerified") values ($1,$2,$3,true)`, [id, `Sample ${name}`, email])
    return { id, email }
  }
  const work = (title: string, doi: string): Candidate => ({ title, year: 2022, venue: 'Journal', doi, authors: ['A. Sample'] })

  it('a CV holds the account’s claimed works and courses, and never pending, rejected, duplicate or another account’s records', async () => {
    const a = await account('a')
    const b = await account('b')
    const pubs = createPgPublicationStore(pool())
    await pubs.addCandidates(a.id, [work('Claimed A', '10.5555/ca'), work('Pending A', '10.5555/pa'), work('Rejected A', '10.5555/ra'), work('Duplicate A', '10.5555/da')], true)
    await pubs.addCandidates(b.id, [work('Claimed B', '10.5555/cb')], true)
    const byTitle = async (id: string, t: string) => (await pubs.list(id)).pending.find((w) => w.title === t)!.id
    const claimedA = await byTitle(a.id, 'Claimed A')
    await pubs.claim(a.id, claimedA)
    await pubs.reject(a.id, await byTitle(a.id, 'Rejected A'))
    await pubs.markDuplicate(a.id, await byTitle(a.id, 'Duplicate A'), claimedA)
    await pubs.claim(b.id, await byTitle(b.id, 'Claimed B'))
    const courses = createPgCourseStore(pool())
    await courses.add(a.id, { code: 'A 1', title: 'A course', season: 'Fall', year: 2026, programme: '' })
    await courses.add(b.id, { code: 'B 1', title: 'B course', season: 'Fall', year: 2026, programme: '' })

    const cv = buildCv(await loadCvInput(pool(), a), 'university', NOW)
    expect(cv.publications.map((p) => p.title)).toEqual(['Claimed A'])
    expect(cv.courses.map((c) => c.code)).toEqual(['A 1'])
    const text = JSON.stringify(cv)
    for (const other of ['Claimed B', 'Pending A', 'Rejected A', 'Duplicate A', 'B course', b.email]) expect(text).not.toContain(other)
    expect(cv.header.email).toBeNull() // visibility defaults to hidden
    const cvB = buildCv(await loadCvInput(pool(), b), 'hec', NOW)
    expect(cvB.publications.map((p) => p.title)).toEqual(['Claimed B'])
    expect(JSON.stringify(cvB)).not.toContain('Claimed A')
  })
})

describe.skipIf(!DB)('department reviewer queue (FP-16, FPR-04, PJ4), PostgreSQL', () => {
  const pool = () => getIdentityPool(DB!)
  const profiles = () => createSampleProfileStore(pool())
  const reviews = () => createPgReviewStore(pool())
  const roles = () => createPgRoleStore(pool())
  const edit = (over: Partial<ProfileEdit> = {}): ProfileEdit => ({ ...EMPTY_EDIT, bio: { en: 'Hello', ur: '' }, ...over })
  const NOW = Date.UTC(2026, 10, 20, 12)

  beforeAll(async () => {
    await migrateDown(DB!, {})
    await migrateUp(DB!, {})
  })
  afterAll(async () => {
    await closeIdentityPool()
  })

  async function account(tag: string, dept?: string, reviewer = false): Promise<{ id: string; email: string }> {
    const id = `rv-${tag}-${Math.random().toString(36).slice(2, 8)}`
    const email = `${id}@example.invalid`
    await pool().query(`insert into "user" ("id","name","email","emailVerified") values ($1,$2,$3,true)`, [id, `Sample ${tag}`, email])
    if (dept) await roles().setDepartment(email, dept)
    if (reviewer) expect(await roles().grantReviewer(email)).toBe('ok')
    return { id, email }
  }
  /** A faculty member in `dept` with a submitted draft; returns the revision that was submitted. */
  async function submitted(a: { id: string; email: string }, e: ProfileEdit = edit()): Promise<number> {
    expect(await profiles().saveDraft(a.id, e)).toBe(true)
    expect(await profiles().submit(a.id)).toBe(true)
    return (await pool().query<{ rev: number }>(`select "rev" from "profile_draft" where "userId" = $1`, [a.id])).rows[0]!.rev
  }
  const dept = () => `Dept ${Math.random().toString(36).slice(2, 8)}`
  const logCount = async (id: string) => (await pool().query(`select count(*)::int as n from "profile_review" where "userId" = $1`, [id])).rows[0].n as number
  const statusOf = async (id: string) => (await pool().query(`select "status","rev","reviewNote" from "profile_draft" where "userId" = $1`, [id])).rows[0] as { status: string; rev: number; reviewNote: string | null }

  describe('who sees what', () => {
    it('lists only submitted drafts from the reviewer’s own department, oldest first, never the reviewer’s own', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const a = await account('a', d)
      const b = await account('b', d.toUpperCase()) // department names compare without case
      const draftOnly = await account('draft', d)
      const other = await account('other', dept())
      const noDept = await account('nodept')
      await submitted(a)
      await submitted(b, edit({ officeHours: 'Mon' }))
      expect(await profiles().saveDraft(draftOnly.id, edit())).toBe(true)
      await submitted(other)
      await submitted(noDept)
      await submitted(rev)
      const q = await reviews().listQueue(rev.id)
      expect(q.map((i) => i.subjectId)).toEqual([a.id, b.id])
      expect(q[0]).toMatchObject({ name: 'Sample a', firstPublication: true, changes: 1 })
      expect(q[1]!.changes).toBe(2)
    })
    it('a decision is allowed across a difference of case in the department name, as the list is', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const b = await account('b', d.toUpperCase())
      const r = await submitted(b)
      expect(await reviews().decide(rev.id, { subjectId: b.id, rev: r, decision: 'approved', note: null }, NOW)).toBe('ok')
    })
    it('a non-reviewer, a person with a department only, and a role without a department all see nothing', async () => {
      const d = dept()
      const plain = await account('plain', d)
      const a = await account('a', d)
      await submitted(a)
      expect(await reviews().isReviewer(plain.id)).toBe(false)
      expect(await reviews().listQueue(plain.id)).toEqual([])
      expect(await reviews().load(plain.id, a.id)).toBeNull()
      const orphan = await account('orphan')
      await pool().query(`insert into "reviewer_role" ("userId") values ($1)`, [orphan.id])
      expect(await reviews().isReviewer(orphan.id)).toBe(false)
      expect(await reviews().listQueue(orphan.id)).toEqual([])
    })
    it('opening one draft answers null the same way for another department, oneself, a draft, a stranger and a malformed id (IDOR)', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const mine = await account('mine', d)
      const draft = await account('draft', d)
      const other = await account('other', dept())
      await submitted(mine)
      await profiles().saveDraft(draft.id, edit())
      await submitted(other)
      await submitted(rev)
      const ok = await reviews().load(rev.id, mine.id)
      expect(ok).toMatchObject({ subjectId: mine.id, department: d, before: null, sample: true })
      expect(ok!.after.bio.en).toBe('Hello')
      for (const id of [other.id, rev.id, draft.id, 'no-such-person', '../x', "a' or '1'='1", '']) expect(await reviews().load(rev.id, id)).toBeNull()
    })
  })

  describe('decisions', () => {
    it('approve publishes the sample edit, returns the draft to its owner, bumps the revision and logs actor and difference', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const f = await account('f', d)
      const r1 = await submitted(f, edit({ bio: { en: 'First', ur: '' } }))
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: r1, decision: 'approved', note: null }, NOW)).toBe('ok')
      const after = await statusOf(f.id)
      expect(after).toEqual({ status: 'draft', rev: r1 + 1, reviewNote: null })
      const l = await profiles().load(f)
      expect(l.published!.bio.en).toBe('First')
      expect(l.publishedAt).toBe(NOW)
      expect(l.profile.department).toBe(d)
      const log = (await pool().query(`select * from "profile_review" where "userId" = $1`, [f.id])).rows
      expect(log).toHaveLength(1)
      expect(log[0]).toMatchObject({ reviewerId: rev.id, decision: 'approved', note: null, before: null })
      expect(log[0].after.bio.en).toBe('First')
      // Second round: the log keeps what was published before.
      const r2 = await submitted(f, edit({ bio: { en: 'Second', ur: '' } }))
      expect((await reviews().listQueue(rev.id))[0]).toMatchObject({ firstPublication: false, changes: 1 })
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: r2, decision: 'approved', note: null }, NOW + 1000)).toBe('ok')
      expect((await profiles().load(f)).published!.bio.en).toBe('Second')
      const second = (await pool().query(`select "before","after" from "profile_review" where "userId" = $1 order by "at" desc limit 1`, [f.id])).rows[0]
      expect(second.before.bio.en).toBe('First')
      expect(second.after.bio.en).toBe('Second')
    })
    it('asking for changes keeps the published edit, stores the note for the owner, and resubmitting clears it', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const f = await account('f', d)
      const r1 = await submitted(f, edit({ bio: { en: 'Draft', ur: '' } }))
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: r1, decision: 'changes-requested', note: 'Please shorten the bio.' }, NOW)).toBe('ok')
      const l = await profiles().load(f)
      expect(l).toMatchObject({ status: 'draft', reviewNote: 'Please shorten the bio.', published: null, publishedAt: null })
      expect((await pool().query(`select 1 from "profile_published" where "userId" = $1`, [f.id])).rowCount).toBe(0)
      expect((await pool().query(`select "decision","note" from "profile_review" where "userId" = $1`, [f.id])).rows).toEqual([{ decision: 'changes-requested', note: 'Please shorten the bio.' }])
      await profiles().saveDraft(f.id, edit({ bio: { en: 'Short', ur: '' } }))
      expect((await profiles().load(f)).reviewNote).toBe('Please shorten the bio.')
      await profiles().submit(f.id)
      expect((await profiles().load(f)).reviewNote).toBeNull()
    })
    it('a decision applies once: the same revision cannot be decided twice', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const f = await account('f', d)
      const r = await submitted(f)
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: r, decision: 'approved', note: null }, NOW)).toBe('ok')
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: r, decision: 'approved', note: null }, NOW)).toBe('stale')
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: r + 1, decision: 'approved', note: null }, NOW)).toBe('stale')
      expect(await logCount(f.id)).toBe(1)
    })
    it('a draft withdrawn, changed and sent again cannot be decided at the revision the reviewer saw', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const f = await account('f', d)
      const seen = await submitted(f, edit({ bio: { en: 'Looked fine', ur: '' } }))
      expect(await profiles().withdraw(f.id)).toBe(true)
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: seen, decision: 'approved', note: null }, NOW)).toBe('stale')
      await profiles().saveDraft(f.id, edit({ bio: { en: 'Swapped after review', ur: '' } }))
      await profiles().submit(f.id)
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: seen, decision: 'approved', note: null }, NOW)).toBe('stale')
      expect(await logCount(f.id)).toBe(0)
      expect((await pool().query(`select 1 from "profile_published" where "userId" = $1`, [f.id])).rowCount).toBe(0)
      expect((await statusOf(f.id)).status).toBe('submitted')
    })
    it('rev goes up on every save, submit and withdraw', async () => {
      const f = await account('f', dept())
      await profiles().saveDraft(f.id, edit())
      const r0 = (await statusOf(f.id)).rev
      await profiles().saveDraft(f.id, edit({ officeHours: 'x' }))
      await profiles().submit(f.id)
      await profiles().withdraw(f.id)
      expect((await statusOf(f.id)).rev).toBe(r0 + 3)
    })
  })

  describe('refusals leave no trace', () => {
    async function untouched(f: { id: string }, r: number) {
      expect(await logCount(f.id)).toBe(0)
      expect((await pool().query(`select 1 from "profile_published" where "userId" = $1`, [f.id])).rowCount).toBe(0)
      expect(await statusOf(f.id)).toMatchObject({ status: 'submitted', rev: r, reviewNote: null })
    }
    it('another department’s reviewer, a plain colleague, oneself, a role without a department and a stranger are all forbidden', async () => {
      const d = dept()
      const f = await account('f', d)
      const r = await submitted(f)
      const otherReviewer = await account('other', dept(), true)
      const colleague = await account('colleague', d)
      const orphan = await account('orphan')
      await pool().query(`insert into "reviewer_role" ("userId") values ($1)`, [orphan.id])
      for (const who of [otherReviewer.id, colleague.id, orphan.id, f.id, 'no-such-user']) {
        expect(await reviews().decide(who, { subjectId: f.id, rev: r, decision: 'approved', note: null }, NOW)).toBe('forbidden')
      }
      await untouched(f, r)
    })
    it('a reviewer cannot approve their own profile, even when they submitted it', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const r = await submitted(rev)
      expect(await reviews().decide(rev.id, { subjectId: rev.id, rev: r, decision: 'approved', note: null }, NOW)).toBe('forbidden')
      await untouched(rev, r)
    })
    it('a revoked reviewer is forbidden immediately', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const f = await account('f', d)
      const r = await submitted(f)
      expect(await roles().revokeReviewer(rev.email)).toBe('ok')
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: r, decision: 'approved', note: null }, NOW)).toBe('forbidden')
      await untouched(f, r)
    })
    it('a reviewer moved to another department loses access to the old one', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const f = await account('f', d)
      const r = await submitted(f)
      await roles().setDepartment(rev.email, dept())
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: r, decision: 'approved', note: null }, NOW)).toBe('forbidden')
      expect(await reviews().listQueue(rev.id)).toEqual([])
      await untouched(f, r)
    })
    it('a failure while publishing rolls back the whole decision', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const f = await account('f', d)
      const r = await submitted(f)
      const broken = createPgReviewStore(pool(), async () => {
        throw new Error('publisher down')
      })
      await expect(broken.decide(rev.id, { subjectId: f.id, rev: r, decision: 'approved', note: null }, NOW)).rejects.toThrow('publisher down')
      await untouched(f, r)
      // The connection went back to the pool clean: a normal decision still works.
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: r, decision: 'approved', note: null }, NOW)).toBe('ok')
    })
    it('hostile stored text is carried as data and extra keys in a stored edit are never published', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const f = await account('f', d)
      const r = await submitted(f)
      await pool().query(`update "profile_draft" set "edit" = $2 where "userId" = $1`, [f.id, JSON.stringify({ ...edit({ bio: { en: '<script>alert(1)</script>', ur: '' } }), designation: { en: 'Vice Chancellor', ur: '' }, department: 'Elsewhere' })])
      expect(await reviews().decide(rev.id, { subjectId: f.id, rev: r, decision: 'approved', note: null }, NOW)).toBe('ok')
      const pub = (await pool().query(`select "edit" from "profile_published" where "userId" = $1`, [f.id])).rows[0].edit
      expect(Object.keys(pub).sort()).toEqual(Object.keys(EMPTY_EDIT).sort())
      expect(pub.bio.en).toBe('<script>alert(1)</script>')
      const logged = (await pool().query(`select "after" from "profile_review" where "userId" = $1`, [f.id])).rows[0].after
      expect(Object.keys(logged).sort()).toEqual(Object.keys(EMPTY_EDIT).sort())
    })
  })

  describe('concurrency', () => {
    it('two reviewers deciding the same draft at once: one succeeds, one is stale, one log entry', async () => {
      const d = dept()
      const r1 = await account('r1', d, true)
      const r2 = await account('r2', d, true)
      const f = await account('f', d)
      const rv = await submitted(f)
      const results = await Promise.all([
        reviews().decide(r1.id, { subjectId: f.id, rev: rv, decision: 'approved', note: null }, NOW),
        reviews().decide(r2.id, { subjectId: f.id, rev: rv, decision: 'changes-requested', note: 'No' }, NOW),
      ])
      expect([...results].sort()).toEqual(['ok', 'stale'])
      expect(await logCount(f.id)).toBe(1)
      const published = (await pool().query(`select 1 from "profile_published" where "userId" = $1`, [f.id])).rowCount
      const decision = (await pool().query(`select "decision" from "profile_review" where "userId" = $1`, [f.id])).rows[0].decision
      expect(published).toBe(decision === 'approved' ? 1 : 0)
    })
    it('the owner withdrawing while a reviewer approves: either the approval lands and the withdraw is refused, or the reverse', async () => {
      for (let i = 0; i < 8; i++) {
        const d = dept()
        const rev = await account('rev', d, true)
        const f = await account('f', d)
        const rv = await submitted(f)
        const [decided, withdrew] = await Promise.all([
          reviews().decide(rev.id, { subjectId: f.id, rev: rv, decision: 'approved', note: null }, NOW),
          profiles().withdraw(f.id),
        ])
        // Never both: an approved edit must not also have been taken back.
        expect(decided === 'ok' && withdrew).toBe(false)
        expect(decided === 'ok' || withdrew).toBe(true)
        expect(await logCount(f.id)).toBe(decided === 'ok' ? 1 : 0)
      }
    })
  })

  describe('the log', () => {
    it('is append-only: rows cannot be rewritten, but clearing the reviewer when their account goes is allowed', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const f = await account('f', d)
      const r = await submitted(f)
      await reviews().decide(rev.id, { subjectId: f.id, rev: r, decision: 'changes-requested', note: 'Original' }, NOW)
      for (const sql of [
        `update "profile_review" set "note" = 'Rewritten' where "userId" = $1`,
        `update "profile_review" set "decision" = 'approved', "note" = null where "userId" = $1`,
        `update "profile_review" set "after" = '{}' where "userId" = $1`,
        `update "profile_review" set "at" = now() where "userId" = $1`,
        `update "profile_review" set "reviewerId" = "userId" where "userId" = $1`,
      ]) await expect(pool().query(sql, [f.id])).rejects.toThrow(/append-only/)
      expect((await pool().query(`select "note","reviewerId" from "profile_review" where "userId" = $1`, [f.id])).rows[0]).toEqual({ note: 'Original', reviewerId: rev.id })
      await pool().query(`delete from "user" where "id" = $1`, [rev.id])
      expect((await pool().query(`select "note","reviewerId" from "profile_review" where "userId" = $1`, [f.id])).rows[0]).toEqual({ note: 'Original', reviewerId: null })
    })
    it('the database itself refuses a note-less change request, a note on an approval, and an unknown decision', async () => {
      const f = await account('f', dept())
      const ins = (decision: string, note: string | null) => pool().query(`insert into "profile_review" ("userId","decision","note","after") values ($1,$2,$3,'{}')`, [f.id, decision, note])
      await expect(ins('changes-requested', null)).rejects.toThrow()
      await expect(ins('approved', 'x')).rejects.toThrow()
      await expect(ins('rejected', 'x')).rejects.toThrow()
      await expect(ins('changes-requested', 'x'.repeat(501))).rejects.toThrow()
    })
    it('deleting the faculty member removes their draft, published edit, department and log with them', async () => {
      const d = dept()
      const rev = await account('rev', d, true)
      const f = await account('f', d)
      const r = await submitted(f)
      await reviews().decide(rev.id, { subjectId: f.id, rev: r, decision: 'approved', note: null }, NOW)
      await pool().query(`delete from "user" where "id" = $1`, [f.id])
      for (const t of ['profile_draft', 'profile_published', 'profile_review', 'account_department']) {
        expect((await pool().query(`select 1 from "${t}" where "userId" = $1`, [f.id])).rowCount).toBe(0)
      }
    })
  })

  describe('roles (operator command)', () => {
    it('sets a tidy department, needs one before granting, and lists who is who', async () => {
      const a = await account('a')
      expect(await roles().grantReviewer(a.email)).toBe('no-department')
      expect(await roles().setDepartment(a.email, '  Computer   Science ')).toBe('ok')
      expect(await roles().setDepartment(a.email.toUpperCase(), 'Computer Science')).toBe('ok')
      expect(await roles().grantReviewer(a.email)).toBe('ok')
      expect(await roles().grantReviewer(a.email)).toBe('ok')
      const row = (await roles().list()).find((r) => r.email === a.email)
      expect(row).toEqual({ email: a.email, department: 'Computer Science', reviewer: true, head: false })
      expect(await roles().revokeReviewer(a.email)).toBe('ok')
      expect(await roles().revokeReviewer(a.email)).toBe('not-reviewer')
    })
    it('refuses unknown accounts and unusable departments without writing anything', async () => {
      expect(await roles().setDepartment('nobody@example.invalid', 'X')).toBe('no-account')
      expect(await roles().grantReviewer('nobody@example.invalid')).toBe('no-account')
      expect(await roles().revokeReviewer('nobody@example.invalid')).toBe('no-account')
      const a = await account('a')
      for (const bad of ['', '   ', 'x'.repeat(81), 'a\u202Eb']) expect(await roles().setDepartment(a.email, bad)).toBe('invalid')
      expect((await pool().query(`select 1 from "account_department" where "userId" = $1`, [a.id])).rowCount).toBe(0)
    })
  })
})

describe.skipIf(!DB)('claim by invitation and activation by the department head (FP-17, FP-01, PJ1), PostgreSQL and the real library', () => {
  let auth: PortalAuth
  let h: ReturnType<typeof createAuthHandlers>
  const pool = () => getIdentityPool(DB!)
  const invitations = () => createPgInvitationStore(pool())
  const heads = () => createPgActivationStore(pool())
  const roles = () => createPgRoleStore(pool())
  const statuses = () => createPgStatusStore(pool())
  const NOW = Date.UTC(2026, 10, 21, 9)
  const PW = 'a sample claim password 15+'
  let seq = 0
  const uniq = () => `${Date.now()}-${++seq}-${Math.random().toString(36).slice(2, 6)}`
  const dept = () => `Dept ${Math.random().toString(36).slice(2, 8)}`

  function claimer(over: { invitations?: Pick<InvitationStore, 'peek' | 'consume'>; now?: () => number } = {}) {
    return createClaimService({
      invitations: over.invitations ?? invitations(),
      accounts: {
        create: async ({ email, password, name }) => ({ id: (await auth.api.signUpEmail({ body: { email, password, name } })).user.id }),
        remove: async (id) => void (await pool().query(`delete from "user" where "id" = $1`, [id])),
        endSessions: async (id) => void (await pool().query(`delete from "session" where "userId" = $1`, [id])),
      },
      now: over.now ?? (() => NOW),
    })
  }
  let tick = 0
  const invite = async (department = dept(), at = NOW) => {
    const email = `claim-${uniq()}@example.invalid`
    const recordRef = `rec_${uniq()}`.replace(/[^A-Za-z0-9_-]/g, '_')
    const made = await invitations().create({ recordRef, email, name: 'Sample Claimant', department }, at)
    return { ...made, email, recordRef, department }
  }
  const userByEmail = async (email: string) => (await pool().query<{ id: string }>(`select "id" from "user" where "email" = $1`, [email])).rows[0]?.id ?? null
  const statusOf = async (id: string) => (await pool().query<{ status: string }>(`select "status" from "account_status" where "userId" = $1`, [id])).rows[0]?.status ?? null

  let jarSeq = 0
  class Jar {
    readonly ip = `198.19.${Math.floor(++jarSeq / 250)}.${(jarSeq % 250) + 1}`
    private c = new Map<string, string>()
    header() { return [...this.c].map(([k, v]) => `${k}=${v}`).join('; ') }
    absorb(res: Response) {
      for (const line of res.headers.getSetCookie()) {
        const [pair] = line.split(';')
        const i = pair!.indexOf('=')
        const name = pair!.slice(0, i), val = pair!.slice(i + 1)
        if (val === '' || /max-age=0/i.test(line)) this.c.delete(name)
        else this.c.set(name, val)
      }
    }
  }
  async function call(jar: Jar, method: 'GET' | 'POST', path: string, body?: unknown) {
    const res = await h[method](new Request(`${BASE}${path}`, { method, headers: { 'content-type': 'application/json', origin: ORIGIN, cookie: jar.header(), 'x-real-ip': jar.ip }, body: body === undefined ? undefined : JSON.stringify(body) }))
    jar.absorb(res)
    return res
  }
  /** What the person does after claiming: sign in with the password, then enrol an authenticator (the first factor). */
  async function enrol(email: string, password = PW) {
    const jar = new Jar()
    expect((await call(jar, 'POST', '/sign-in/email', { email, password })).status).toBe(200)
    const enable = (await (await call(jar, 'POST', '/two-factor/enable', { password })).json()) as { totpURI: string }
    const secret = new URL(enable.totpURI).searchParams.get('secret') ?? ''
    expect((await call(jar, 'POST', '/two-factor/verify-totp', { code: totpAt(secret, Date.now() - 30_000) })).status).toBe(200)
    return jar
  }
  /** A claimed and enrolled person, pending activation, in `department`. */
  async function pending(department: string) {
    const inv = await invite(department)
    // Each claim a minute after the last, so "oldest first" is a real order and not a tie.
    expect(await claimer({ now: () => NOW + ++tick * 60_000 }).claim(inv.token, PW)).toEqual({ ok: true })
    const id = (await userByEmail(inv.email))!
    const jar = await enrol(inv.email)
    return { ...inv, id, jar }
  }
  async function head(department: string) {
    const email = `head-${uniq()}@example.invalid`
    const id = (await auth.api.signUpEmail({ body: { email, password: PW, name: 'Sample Head' } })).user.id
    await pool().query(`delete from "session" where "userId" = $1`, [id])
    expect(await roles().setDepartment(email, department)).toBe('ok')
    expect(await roles().grantHead(email)).toBe('ok')
    return { id, email }
  }

  beforeAll(async () => {
    await migrateDown(DB!, {})
    await migrateUp(DB!, {})
    const config = readPortalConfig(env)
    if (!config.enabled) throw new Error(`config: ${config.reason}`)
    auth = createPortalAuth(config)
    const p = getIdentityPool(config.databaseUrl)
    h = createAuthHandlers({
      env,
      getAuth: () => auth as unknown as AuthLike,
      loadFactors: (id) => loadFactors(p, id),
      isStrongSession: (id) => createPgAssuranceStore(p).isStrong(id),
      accountStatus: (id) => createPgStatusStore(p).get(id),
      lastVerifiedAt: (id) => createPgAssuranceStore(p).lastVerifiedAt(id),
      endSession: (id) => createPgSessionStore(p).end(id),
      touchSession: (id, now) => createPgSessionStore(p).touch(id, now),
      signInThrottle: createSignInThrottle({ store: createPgThrottleStore(p) }),
    })
  })
  afterAll(async () => {
    await closeIdentityPool()
  })

  describe('invitations', () => {
    it('store only a hash, last exactly 72 hours, and are found only by the exact token', async () => {
      const i = await invite()
      const row = (await pool().query(`select "tokenHash","expiresAt","createdAt" from "invitation" where "recordRef" = $1`, [i.recordRef])).rows[0]
      expect(row.tokenHash).toBe(hashToken(i.token))
      expect(JSON.stringify(row)).not.toContain(i.token)
      expect(row.expiresAt.getTime() - row.createdAt.getTime()).toBe(INVITATION_TTL_MS)
      expect(i.expiresAt).toBe(NOW + INVITATION_TTL_MS)
      expect(await invitations().peek(i.token, NOW)).toMatchObject({ email: i.email, department: i.department })
      for (const bad of [i.token.slice(0, -1) + (i.token.endsWith('A') ? 'B' : 'A'), '', 'x'.repeat(43), "' or 1=1 --", `${i.token} `]) expect(await invitations().peek(bad, NOW), bad).toBeNull()
    })
    it('are open until the second they expire, and no longer after', async () => {
      const i = await invite()
      expect(await invitations().peek(i.token, NOW + INVITATION_TTL_MS - 1)).not.toBeNull()
      expect(await invitations().peek(i.token, NOW + INVITATION_TTL_MS)).toBeNull()
      expect(await invitations().peek(i.token, NOW + INVITATION_TTL_MS + 1)).toBeNull()
    })
    it('inviting the same record again revokes the earlier link', async () => {
      const a = await invite()
      const b = await invitations().create({ recordRef: a.recordRef, email: a.email, name: 'Sample Claimant', department: a.department }, NOW + 1000)
      expect(await invitations().peek(a.token, NOW + 1000)).toBeNull()
      expect(await invitations().peek(b.token, NOW + 1000)).not.toBeNull()
      expect((await pool().query(`select count(*)::int as n from "invitation" where "recordRef" = $1 and "usedAt" is null and "revokedAt" is null`, [a.recordRef])).rows[0].n).toBe(1)
      expect(await claimer().claim(a.token, PW)).toEqual({ ok: false, error: 'unavailable' })
    })
    it('the database refuses a second open invitation for a record and an expiry before creation', async () => {
      const a = await invite()
      const ins = (ref: string, exp: string) => pool().query(`insert into "invitation" ("tokenHash","recordRef","email","name","department","expiresAt") values ($1,$2,'a@b.invalid','n','d',${exp})`, [hashToken(`${Math.random()}`), ref])
      await expect(ins(a.recordRef, `now() + interval '1 day'`)).rejects.toThrow()
      await expect(ins(`rec_${uniq()}`, `now() - interval '1 day'`)).rejects.toThrow()
    })
  })

  describe('claiming', () => {
    it('creates a pending account in the invited department with the claim recorded, no session, and the password signs in', async () => {
      const i = await invite()
      expect(await claimer().claim(i.token, PW)).toEqual({ ok: true })
      const id = (await userByEmail(i.email))!
      expect(await statusOf(id)).toBe('pending-activation')
      expect((await pool().query(`select "department" from "account_department" where "userId" = $1`, [id])).rows[0].department).toBe(i.department)
      const inv = (await pool().query(`select "usedAt","userId" from "invitation" where "recordRef" = $1`, [i.recordRef])).rows[0]
      expect(inv.userId).toBe(id)
      expect(inv.usedAt.getTime()).toBe(NOW)
      expect((await pool().query(`select count(*)::int as n from "session" where "userId" = $1`, [id])).rows[0].n).toBe(0)
      expect((await call(new Jar(), 'POST', '/sign-in/email', { email: i.email, password: PW })).status).toBe(200)
    })
    it('works once: the same link again, an expired link and a made-up link all give the same answer', async () => {
      const i = await invite()
      expect(await claimer().claim(i.token, PW)).toEqual({ ok: true })
      const again = await claimer().claim(i.token, PW)
      const old = await invite(dept(), NOW - INVITATION_TTL_MS - 5000)
      const expired = await claimer().claim(old.token, PW)
      const unknown = await claimer().claim('x'.repeat(43), PW)
      expect([again, expired, unknown]).toEqual([{ ok: false, error: 'unavailable' }, { ok: false, error: 'unavailable' }, { ok: false, error: 'unavailable' }])
      expect(await userByEmail(old.email)).toBeNull()
    })
    it('two people using one link at once: one account, one pending status', async () => {
      const i = await invite()
      const results = await Promise.all([claimer().claim(i.token, PW), claimer().claim(i.token, `${PW} second`)])
      expect(results.filter((r) => r.ok)).toHaveLength(1)
      expect((await pool().query(`select count(*)::int as n from "user" where "email" = $1`, [i.email])).rows[0].n).toBe(1)
      const id = (await userByEmail(i.email))!
      expect(await statusOf(id)).toBe('pending-activation')
      expect((await pool().query(`select count(*)::int as n from "account_status" where "userId" = $1`, [id])).rows[0].n).toBe(1)
    })
    it('the store itself uses a link once: a second consume for another account changes nothing (not only the claim service guards this)', async () => {
      const i = await invite()
      const mk = async () => (await auth.api.signUpEmail({ body: { email: `direct-${uniq()}@example.invalid`, password: PW, name: 'Direct' } })).user.id
      const u1 = await mk()
      const u2 = await mk()
      expect(await invitations().consume(i.token, u1, NOW)).toBe('ok')
      expect(await invitations().consume(i.token, u2, NOW)).toBe('unavailable')
      expect(await statusOf(u1)).toBe('pending-activation')
      expect(await statusOf(u2)).toBeNull()
      expect((await pool().query(`select "userId" from "invitation" where "recordRef" = $1`, [i.recordRef])).rows[0].userId).toBe(u1)
    })
    it('a short password changes nothing and the link stays usable', async () => {
      const i = await invite()
      expect(await claimer().claim(i.token, 'too short')).toEqual({ ok: false, error: 'password' })
      expect(await userByEmail(i.email)).toBeNull()
      expect(await claimer().claim(i.token, PW)).toEqual({ ok: true })
    })
    it('an address that already has an account is refused like any bad link, and the link is not used up', async () => {
      const i = await invite()
      await auth.api.signUpEmail({ body: { email: i.email, password: PW, name: 'Someone else' } })
      expect(await claimer().claim(i.token, PW)).toEqual({ ok: false, error: 'unavailable' })
      expect(await invitations().peek(i.token, NOW)).not.toBeNull()
    })
    it('if using the link fails, the new account is removed and not left active with no status row', async () => {
      const i = await invite()
      const broken = claimer({ invitations: { peek: (t, n) => invitations().peek(t, n), consume: async () => { throw new Error('db down') } } })
      await expect(broken.claim(i.token, PW)).rejects.toThrow('db down')
      expect(await userByEmail(i.email)).toBeNull()
      expect(await claimer().claim(i.token, PW)).toEqual({ ok: true })
    })
    it('a record that was already claimed cannot be claimed again by a second link', async () => {
      const first = await invite()
      expect(await claimer().claim(first.token, PW)).toEqual({ ok: true })
      const second = await invitations().create({ recordRef: first.recordRef, email: `other-${uniq()}@example.invalid`, name: 'Impostor', department: first.department }, NOW)
      const before = (await pool().query(`select count(*)::int as n from "user"`)).rows[0].n
      expect(await claimer().claim(second.token, PW)).toEqual({ ok: false, error: 'unavailable' })
      expect((await pool().query(`select count(*)::int as n from "user"`)).rows[0].n).toBe(before)
    })
  })

  describe('a pending account', () => {
    it('can enrol and read its session, but every other endpoint is refused with a pointer to the waiting page', async () => {
      const p = await pending(dept())
      expect((await call(p.jar, 'GET', '/get-session')).status).toBe(200)
      const res = await call(p.jar, 'GET', '/passkey/list-user-passkeys')
      expect(res.status).toBe(403)
      expect(await res.json()).toMatchObject({ error: 'account not active', redirectTo: '/portal/pending' })
      expect((await call(p.jar, 'POST', '/passkey/delete-passkey', { id: 'x' })).status).toBe(403)
      expect((await call(p.jar, 'POST', '/two-factor/disable', { password: PW })).status).toBe(403)
    })
    it('is let in the moment the head activates it, with the same session', async () => {
      const d = dept()
      const p = await pending(d)
      const hd = await head(d)
      expect(await heads().decide(hd.id, { subjectId: p.id, decision: 'activated' }, NOW)).toBe('ok')
      expect((await call(p.jar, 'GET', '/passkey/list-user-passkeys')).status).toBe(200)
    })
    it('a suspended or left account is signed out at once and cannot sign in to anything', async () => {
      const d = dept()
      const p = await pending(d)
      const hd = await head(d)
      await heads().decide(hd.id, { subjectId: p.id, decision: 'activated' }, NOW)
      expect(await statuses().set(p.id, 'left', NOW)).toBe('ok')
      expect((await call(p.jar, 'GET', '/passkey/list-user-passkeys')).status).toBe(401)
      expect((await pool().query(`select count(*)::int as n from "session" where "userId" = $1`, [p.id])).rows[0].n).toBe(0)
      expect(await statuses().set('no-such-user', 'left', NOW)).toBe('no-account')
    })
  })

  describe('activation by the department head', () => {
    it('lists only enrolled pending people from the head’s own department (case ignored), oldest first, never the head', async () => {
      const d = dept()
      const hd = await head(d)
      const a = await pending(d.toUpperCase())
      const b = await pending(d)
      const other = await pending(dept())
      const notEnrolled = await invite(d)
      await claimer().claim(notEnrolled.token, PW)
      const items = await heads().listPending(hd.id)
      expect(items.map((i) => i.subjectId)).toEqual([a.id, b.id])
      expect(items[0]).toMatchObject({ email: a.email, recordRef: a.recordRef })
      expect(items.map((i) => i.subjectId)).not.toContain(other.id)
      expect(await heads().isHead(hd.id)).toBe(true)
      expect(await heads().isHead(a.id)).toBe(false)
      expect(await heads().listPending(a.id)).toEqual([])
    })
    it('activate confirms the person, records who and when, and appends to the log', async () => {
      const d = dept()
      const hd = await head(d)
      const p = await pending(d)
      expect(await heads().decide(hd.id, { subjectId: p.id, decision: 'activated' }, NOW)).toBe('ok')
      expect(await statusOf(p.id)).toBe('active')
      const row = (await pool().query(`select "activatedBy","activatedAt" from "account_status" where "userId" = $1`, [p.id])).rows[0]
      expect(row.activatedBy).toBe(hd.id)
      expect(row.activatedAt.getTime()).toBe(NOW)
      expect((await pool().query(`select "decision","reviewerId" from "account_review" where "userId" = $1`, [p.id])).rows).toEqual([{ decision: 'activated', reviewerId: hd.id }])
    })
    it('decline suspends the account and ends its sessions', async () => {
      const d = dept()
      const hd = await head(d)
      const p = await pending(d)
      expect(await heads().decide(hd.id, { subjectId: p.id, decision: 'declined' }, NOW)).toBe('ok')
      expect(await statusOf(p.id)).toBe('suspended')
      expect((await pool().query(`select count(*)::int as n from "session" where "userId" = $1`, [p.id])).rows[0].n).toBe(0)
      expect((await call(p.jar, 'GET', '/get-session')).status).not.toBe(200)
    })
    it('is refused for another department, a non-head, oneself, a stranger and a revoked head, and changes nothing', async () => {
      const d = dept()
      const p = await pending(d)
      const otherHead = await head(dept())
      const plain = await pending(d)
      const revoked = await head(d)
      expect(await roles().revokeHead(revoked.email)).toBe('ok')
      for (const who of [otherHead.id, plain.id, p.id, 'no-such-user', revoked.id]) {
        expect(await heads().decide(who, { subjectId: p.id, decision: 'activated' }, NOW), who).toBe('forbidden')
      }
      expect(await statusOf(p.id)).toBe('pending-activation')
      expect((await pool().query(`select count(*)::int as n from "account_review" where "userId" = $1`, [p.id])).rows[0].n).toBe(0)
    })
    it('a head cannot activate themselves even if their own account is pending', async () => {
      const d = dept()
      const hd = await head(d)
      await pool().query(`insert into "account_status" ("userId","status") values ($1,'pending-activation')`, [hd.id])
      expect(await heads().decide(hd.id, { subjectId: hd.id, decision: 'activated' }, NOW)).toBe('forbidden')
    })
    it('applies once, and not before a second factor is enrolled', async () => {
      const d = dept()
      const hd = await head(d)
      const p = await pending(d)
      expect(await heads().decide(hd.id, { subjectId: p.id, decision: 'activated' }, NOW)).toBe('ok')
      expect(await heads().decide(hd.id, { subjectId: p.id, decision: 'declined' }, NOW)).toBe('stale')
      const i = await invite(d)
      await claimer().claim(i.token, PW)
      const id = (await userByEmail(i.email))!
      expect(await heads().decide(hd.id, { subjectId: id, decision: 'activated' }, NOW)).toBe('stale')
      expect(await statusOf(id)).toBe('pending-activation')
    })
    it('two heads deciding at once: one succeeds, one is stale, one log entry', async () => {
      const d = dept()
      const h1 = await head(d)
      const h2 = await head(d)
      const p = await pending(d)
      const r = await Promise.all([heads().decide(h1.id, { subjectId: p.id, decision: 'activated' }, NOW), heads().decide(h2.id, { subjectId: p.id, decision: 'declined' }, NOW)])
      expect([...r].sort()).toEqual(['ok', 'stale'])
      expect((await pool().query(`select count(*)::int as n from "account_review" where "userId" = $1`, [p.id])).rows[0].n).toBe(1)
    })
    it('the log is append-only, keeps the entry when the head’s account goes, and goes with the person', async () => {
      const d = dept()
      const hd = await head(d)
      const p = await pending(d)
      await heads().decide(hd.id, { subjectId: p.id, decision: 'activated' }, NOW)
      for (const sql of [`update "account_review" set "decision" = 'declined' where "userId" = $1`, `update "account_review" set "at" = now() where "userId" = $1`, `update "account_review" set "reviewerId" = "userId" where "userId" = $1`]) {
        await expect(pool().query(sql, [p.id])).rejects.toThrow(/append-only/)
      }
      await pool().query(`delete from "user" where "id" = $1`, [hd.id])
      expect((await pool().query(`select "reviewerId" from "account_review" where "userId" = $1`, [p.id])).rows[0].reviewerId).toBeNull()
      await pool().query(`delete from "user" where "id" = $1`, [p.id])
      for (const t of ['account_review', 'account_status', 'account_department']) expect((await pool().query(`select 1 from "${t}" where "userId" = $1`, [p.id])).rowCount).toBe(0)
    })
  })

  describe('status rules', () => {
    it('an account with no status row is active, and the database refuses an unknown status', async () => {
      const email = `legacy-${uniq()}@example.invalid`
      const id = (await auth.api.signUpEmail({ body: { email, password: PW, name: 'Legacy' } })).user.id
      expect(await statuses().get(id)).toBe('active')
      await expect(pool().query(`insert into "account_status" ("userId","status") values ($1,'admin')`, [id])).rejects.toThrow()
    })
    it('heads and statuses are set only by the operator command (store level): a head needs a department', async () => {
      const email = `nodept-${uniq()}@example.invalid`
      await auth.api.signUpEmail({ body: { email, password: PW, name: 'No Dept' } })
      expect(await roles().grantHead(email)).toBe('no-department')
      expect(await roles().grantHead('nobody@example.invalid')).toBe('no-account')
      expect(await roles().revokeHead(email)).toBe('not-reviewer')
    })
  })
})
