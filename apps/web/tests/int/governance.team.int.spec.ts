// @vitest-environment node
/**
 * Slice 3hod (gap D1): a head of an office, an Approver, manages the Editors and Contributors of the
 * offices they hold, and nothing else (docs/briefs/p3hod-team.md).
 */
import type { Payload, Where } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import { as, can, getTestPayload, makeUser, refusal, uniq } from '../helpers/governance'

let payload: Payload
// Offices are unique per run so people left in the shared test database by other tests never match.
let A: string, B: string, C: string
let admin: User, manager: User, auditor: User
let head: User, headOfTwo: User, peerApprover: User, otherHead: User
let teamEditor: User, teamContributor: User, sharedEditor: User, otherEditor: User, auditorOfA: User

const password = 'a-long-enough-password'
const newAccount = (extra: Record<string, unknown> = {}) => ({
  email: `${uniq('new')}@example.test`,
  password,
  name: 'New person',
  ...extra,
})
const ids = (users: Array<{ id: number }>) => users.map((u) => u.id).sort()
const readAs = async (u: User, where: Where) =>
  (
    await payload.find({
      collection: 'users',
      where,
      limit: 100,
      depth: 0,
      ...as(u),
    })
  ).docs as unknown as User[]
const stored = (id: number) =>
  payload.findByID({ collection: 'users', id, overrideAccess: true, depth: 0 })
const update = (actor: User, id: number, data: Record<string, unknown>) =>
  payload.update({ collection: 'users', id, data: data as never, ...as(actor) })
const audit = async (id: number) =>
  (
    await payload.find({
      collection: 'audit-logs',
      where: { and: [{ collection: { equals: 'users' } }, { recordId: { equals: String(id) } }] },
      sort: 'createdAt',
      limit: 50,
      overrideAccess: true,
      depth: 0,
    })
  ).docs

beforeAll(async () => {
  payload = await getTestPayload()
  ;[A, B, C] = [uniq('dept-a'), uniq('dept-b'), uniq('dept-c')].map((s) => s.toLowerCase())
  ;[admin, manager, auditor] = await Promise.all([
    makeUser(payload, 'platformAdmin'),
    makeUser(payload, 'siteManager'),
    makeUser(payload, 'auditor'),
  ])
  head = await makeUser(payload, 'approver', [A])
  headOfTwo = await makeUser(payload, 'approver', [A, C])
  peerApprover = await makeUser(payload, 'approver', [A])
  otherHead = await makeUser(payload, 'approver', [B])
  teamEditor = await makeUser(payload, 'editor', [A])
  teamContributor = await makeUser(payload, 'contributor', [A])
  sharedEditor = await makeUser(payload, 'editor', [A, B])
  otherEditor = await makeUser(payload, 'editor', [B])
  auditorOfA = await makeUser(payload, 'auditor', [A])
})

describe('what a head can see', () => {
  const everyone = () => [
    admin,
    manager,
    auditor,
    head,
    headOfTwo,
    peerApprover,
    otherHead,
    teamEditor,
    teamContributor,
    sharedEditor,
    otherEditor,
    auditorOfA,
  ]
  const idList = () => ({ id: { in: everyone().map((u) => u.id) } })

  it('their own account and the Editors and Contributors who share their office, no one else', async () => {
    const seen = ids(await readAs(head, idList()))
    expect(seen).toEqual(ids([head, teamEditor, teamContributor, sharedEditor]))
  })

  it('a head of another office sees a different team', async () => {
    expect(ids(await readAs(otherHead, idList()))).toEqual(
      ids([otherHead, sharedEditor, otherEditor]),
    )
  })

  it('a head with no office, or a person of any other role, still sees only themselves', async () => {
    const noOffice = await makeUser(payload, 'approver', [])
    expect(
      ids(
        await readAs(noOffice, {
          id: {
            in: everyone()
              .map((u) => u.id)
              .concat(noOffice.id),
          },
        }),
      ),
    ).toEqual([noOffice.id])
    expect(ids(await readAs(teamEditor, idList()))).toEqual([teamEditor.id])
  })

  it('platform admin, site manager and auditor still see everyone', async () => {
    for (const u of [admin, manager, auditor])
      expect(ids(await readAs(u, idList()))).toEqual(ids(everyone()))
  })
})

describe('adding people', () => {
  it('a head creates an Editor or a Contributor for their own office, with the offices stored normalised', async () => {
    const e = await payload.create({
      collection: 'users',
      data: newAccount({ role: 'editor', offices: [`  ${A.toUpperCase()} `] }) as never,
      ...as(head),
    })
    expect(e).toMatchObject({ role: 'editor', offices: [A] })
    const c = await payload.create({
      collection: 'users',
      data: newAccount({ role: 'contributor', offices: [A] }) as never,
      ...as(head),
    })
    expect(c).toMatchObject({ role: 'contributor', offices: [A] })
  })

  it('no role and no office gives a Contributor in the head’s only office', async () => {
    const created = await payload.create({
      collection: 'users',
      data: newAccount() as never,
      ...as(head),
    })
    expect(created).toMatchObject({ role: 'contributor', offices: [A] })
  })

  it('the new person can sign in with the password the head chose', async () => {
    const data = newAccount({ role: 'editor', offices: [A] })
    await payload.create({ collection: 'users', data: data as never, ...as(head) })
    const login = await payload.login({
      collection: 'users',
      data: { email: data.email, password },
    })
    expect(login.token).toBeTruthy()
  })

  it.each([
    ['an Approver', () => ({ role: 'approver', offices: [A] }), 'TEAM_ROLE_FORBIDDEN'],
    ['a Platform Admin', () => ({ role: 'platformAdmin', offices: [A] }), 'TEAM_ROLE_FORBIDDEN'],
    ['a Site Manager', () => ({ role: 'siteManager', offices: [A] }), 'TEAM_ROLE_FORBIDDEN'],
    ['an Auditor', () => ({ role: 'auditor', offices: [A] }), 'TEAM_ROLE_FORBIDDEN'],
    [
      'an Editor for another office',
      () => ({ role: 'editor', offices: [B] }),
      'TEAM_OFFICE_FORBIDDEN',
    ],
    [
      'an Editor for their office and another',
      () => ({ role: 'editor', offices: [A, B] }),
      'TEAM_OFFICE_FORBIDDEN',
    ],
  ])('refuses %s', async (_label, extra, code) => {
    const data = newAccount(extra())
    expect(
      await refusal(() =>
        payload.create({ collection: 'users', data: data as never, ...as(head) }),
      ),
    ).toBe(code)
    // And nothing was created.
    const found = await payload.find({
      collection: 'users',
      where: { email: { equals: data.email } },
      overrideAccess: true,
    })
    expect(found.totalDocs).toBe(0)
  })

  it('a head of two offices must say which', async () => {
    expect(
      await refusal(() =>
        payload.create({
          collection: 'users',
          data: newAccount({ role: 'editor' }) as never,
          ...as(headOfTwo),
        }),
      ),
    ).toBe('TEAM_OFFICE_REQUIRED')
  })

  it('nobody else can add people: editors, contributors, auditors and site managers are still refused', async () => {
    for (const u of [teamEditor, teamContributor, auditorOfA, manager]) {
      expect(
        await can(() =>
          payload.create({ collection: 'users', data: newAccount() as never, ...as(u) }),
        ),
        u.role as string,
      ).toBe(false)
    }
  })
})

describe('changing people', () => {
  it('moves a team member between Editor and Contributor, and a normal save of the whole document goes through', async () => {
    const person = await makeUser(payload, 'editor', [A])
    const doc = await stored(person.id)
    const out = await update(head, person.id, {
      name: doc.name,
      email: doc.email,
      role: 'contributor',
      offices: [A],
    })
    expect(out.role).toBe('contributor')
    expect((await stored(person.id)).role).toBe('contributor')
    expect((await update(head, person.id, { role: 'editor' })).role).toBe('editor')
  })

  it('takes their office off a person who works for two, leaving the other office alone', async () => {
    const person = await makeUser(payload, 'editor', [A, B])
    const out = await update(head, person.id, { offices: [A, B].filter((o) => o !== A) })
    expect(out.offices).toEqual([B])
    // They are no longer on this head’s team: the head cannot even read them now.
    expect(
      await can(() => payload.findByID({ collection: 'users', id: person.id, ...as(head) })),
    ).toBe(false)
  })

  it('a head of two offices can add the second office to a person on the first', async () => {
    const person = await makeUser(payload, 'contributor', [A])
    const out = await update(headOfTwo, person.id, { offices: [A, C] })
    expect(out.offices?.slice().sort()).toEqual([A, C].sort())
  })

  it.each([
    ['promote to Approver', () => ({ role: 'approver' }), 'TEAM_ROLE_FORBIDDEN'],
    ['promote to Platform Admin', () => ({ role: 'platformAdmin' }), 'TEAM_ROLE_FORBIDDEN'],
    ['give an office that is not theirs', () => ({ offices: [A, B] }), 'TEAM_OFFICE_FORBIDDEN'],
    [
      'change the email address',
      () => ({ email: 'takeover@example.test' }),
      'TEAM_FIELD_FORBIDDEN',
    ],
    ['change the name', () => ({ name: 'Somebody Else' }), 'TEAM_FIELD_FORBIDDEN'],
    ['set a password', () => ({ password: 'another-long-password' }), 'TEAM_FIELD_FORBIDDEN'],
    ['leave them with no office', () => ({ offices: [] }), 'TEAM_OFFICE_REQUIRED'],
  ])('refuses to %s, and the stored account does not change', async (_label, make, code) => {
    const data = make()
    const person = await makeUser(payload, 'editor', [A])
    const before = await stored(person.id)
    expect(await refusal(() => update(head, person.id, data))).toBe(code)
    const after = await stored(person.id)
    expect({
      role: after.role,
      offices: after.offices,
      email: after.email,
      name: after.name,
    }).toEqual({
      role: before.role,
      offices: before.offices,
      email: before.email,
      name: before.name,
    })
  })

  it('cannot take away an office that is not theirs from a person who has it', async () => {
    const both = await makeUser(payload, 'editor', [A, B])
    expect(await refusal(() => update(head, both.id, { offices: [A] }))).toBe(
      'TEAM_OFFICE_FORBIDDEN',
    )
    expect((await stored(both.id)).offices?.slice().sort()).toEqual([A, B].sort())
  })

  it('cannot touch anyone outside the team: another office, a peer Approver, an Auditor, an admin', async () => {
    for (const other of [otherEditor, otherHead, admin, manager, auditorOfA, peerApprover]) {
      const before = await stored(other.id)
      expect(
        await can(() => update(head, other.id, { role: 'contributor' })),
        String(other.role),
      ).toBe(false)
      expect((await stored(other.id)).role).toBe(before.role)
    }
  })

  it('cannot change their own role or offices', async () => {
    const out = await update(head, head.id, {
      role: 'platformAdmin',
      offices: [A, B, C],
      name: uniq('renamed'),
    })
    expect(out.role).toBe('approver')
    expect(out.offices).toEqual([A])
    expect(out.name).toMatch(/^renamed/)
  })

  it('an Editor still cannot change anyone, and a site manager cannot either', async () => {
    const person = await makeUser(payload, 'contributor', [A])
    for (const u of [teamEditor, manager])
      expect(await can(() => update(u, person.id, { role: 'editor' })), u.role as string).toBe(
        false,
      )
  })
})

describe('removing people', () => {
  it('a head deletes a person who works for no other office', async () => {
    const person = await makeUser(payload, 'contributor', [A])
    await payload.delete({ collection: 'users', id: person.id, ...as(head) })
    const found = await payload.find({
      collection: 'users',
      where: { id: { equals: person.id } },
      overrideAccess: true,
    })
    expect(found.totalDocs).toBe(0)
  })

  it('refuses when the person also works for another office, and says what to do instead', async () => {
    const both = await makeUser(payload, 'editor', [A, B])
    let message = ''
    const code = await refusal(async () => {
      try {
        await payload.delete({ collection: 'users', id: both.id, ...as(head) })
      } catch (e) {
        message = (e as Error).message
        throw e
      }
    })
    expect(code).toBe('TEAM_TARGET_FORBIDDEN')
    expect(message).toMatch(/Take your office off/)
    expect((await stored(both.id)).id).toBe(both.id)
  })

  it('cannot delete anyone outside the team, or themselves, or an admin', async () => {
    for (const other of [otherEditor, admin, manager, peerApprover, auditorOfA, head]) {
      expect(
        await can(() => payload.delete({ collection: 'users', id: other.id, ...as(head) })),
        String(other.role),
      ).toBe(false)
      expect((await stored(other.id)).id).toBe(other.id)
    }
  })

  it('an Editor or Site Manager still cannot delete accounts', async () => {
    const person = await makeUser(payload, 'contributor', [A])
    for (const u of [teamEditor, manager])
      expect(
        await can(() => payload.delete({ collection: 'users', id: person.id, ...as(u) })),
      ).toBe(false)
  })
})

describe('every change is in the audit log', () => {
  it('create, change and delete by a head name the head as the actor, and no password is stored in the log', async () => {
    const data = newAccount({ role: 'editor', offices: [A] })
    const made = (await payload.create({
      collection: 'users',
      data: data as never,
      ...as(head),
    })) as unknown as User
    await update(head, made.id, { role: 'contributor' })
    await payload.delete({ collection: 'users', id: made.id, ...as(head) })

    const log = await audit(made.id)
    expect(log.map((e) => e.action)).toEqual(['create', 'update', 'delete'])
    for (const e of log)
      expect(e).toMatchObject({
        actorKind: 'user',
        actorId: String(head.id),
        actorRole: 'approver',
      })
    const text = JSON.stringify(log)
    expect(text).not.toContain(password)
    expect(text).not.toMatch(/"(hash|salt)"\s*:\s*"[^"]{8,}/)
  })
})

describe('a platform admin keeps everything', () => {
  it('creates any role, changes any office, deletes anyone', async () => {
    const p = (await payload.create({
      collection: 'users',
      data: newAccount({ role: 'approver', offices: [B] }) as never,
      ...as(admin),
    })) as unknown as User
    expect((await update(admin, p.id, { role: 'siteManager', offices: [A, B, C] })).role).toBe(
      'siteManager',
    )
    await payload.delete({ collection: 'users', id: p.id, ...as(admin) })
  })
})
