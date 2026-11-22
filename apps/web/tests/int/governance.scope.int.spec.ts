// @vitest-environment node
/**
 * Slice 3ah (docs/briefs/p3ah-academic-scope.md): the head of a department reviews its pages and all
 * its programmes; a programme coordinator writes only their own programme; main pages belong to the
 * platform admin. Real Postgres, access enforced the way the admin does it.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import type { User } from '../../src/payload-types'
import {
  as,
  can,
  getTestPayload,
  makeUser,
  pageData,
  refusal,
  system,
  uniq,
} from '../helpers/governance'

let payload: Payload
let admin: User
let manager: User
let hod: User
let otherHod: User
let coordSe: User
let coordCs: User
let officeEditor: User
let office: string
let dept: { id: number }
let otherDept: { id: number }
let se: { id: number }
let cs: { id: number }
let foreign: { id: number }

const source = 'https://example.test/source'

async function reload(u: User): Promise<User> {
  return (await payload.findByID({
    collection: 'users',
    id: u.id,
    depth: 0,
    overrideAccess: true,
  })) as User
}

async function coordinator(programmes: number[]): Promise<User> {
  const u = await makeUser(payload, 'editor', [])
  await payload.update({
    collection: 'users',
    id: u.id,
    data: { programmes } as never,
    overrideAccess: true,
  })
  return reload(u)
}

const makeDept = (ownerOffice: string) =>
  payload.create({
    collection: 'departments',
    draft: true,
    data: { name: uniq('dept'), governance: { ownerOffice, source } } as never,
    ...as(admin),
  }) as Promise<{ id: number }>

const makeProgramme = (department: number, typedOffice = 'typed-somewhere-else') =>
  payload.create({
    collection: 'programmes',
    draft: true,
    data: {
      name: uniq('prog'),
      department,
      governance: { ownerOffice: typedOffice, source },
    } as never,
    ...as(admin),
  }) as Promise<{ id: number }>

const edit = (
  user: User,
  collection: 'programmes' | 'departments' | 'pages',
  id: number,
  data = {},
) => payload.update({ collection, id, draft: true, data: { ...data } as never, ...as(user) })

const move = (
  user: User,
  collection: 'programmes' | 'departments' | 'pages',
  id: number,
  governance: Record<string, unknown>,
) => edit(user, collection, id, { governance })

beforeAll(async () => {
  payload = await getTestPayload()
  office = uniq('dcst')
  ;[admin, manager] = await Promise.all([
    makeUser(payload, 'platformAdmin'),
    makeUser(payload, 'siteManager'),
  ])
  dept = await makeDept(office)
  otherDept = await makeDept(uniq('physics'))
  se = await makeProgramme(dept.id)
  cs = await makeProgramme(dept.id)
  foreign = await makeProgramme(otherDept.id)
  hod = await makeUser(payload, 'approver', [office])
  otherHod = await makeUser(payload, 'approver', [uniq('other-office')])
  officeEditor = await makeUser(payload, 'editor', [office])
  coordSe = await coordinator([se.id])
  coordCs = await coordinator([cs.id])
})

describe('a programme takes its department office', () => {
  it('whatever was typed, the office is the department’s', async () => {
    const row = (await payload.findByID({
      collection: 'programmes',
      id: se.id,
      draft: true,
      depth: 0,
      overrideAccess: true,
    })) as { governance?: { ownerOffice?: string } }
    expect(row.governance?.ownerOffice).toBe(office)
  })

  it('a programme of another department has that department’s office instead', async () => {
    const row = (await payload.findByID({
      collection: 'programmes',
      id: foreign.id,
      draft: true,
      depth: 0,
      overrideAccess: true,
    })) as { governance?: { ownerOffice?: string } }
    expect(row.governance?.ownerOffice).not.toBe(office)
  })
})

describe('a programme coordinator', () => {
  it('edits and sends their own programme for review', async () => {
    await edit(coordSe, 'programmes', se.id, { name: uniq('renamed') })
    const r = (await move(coordSe, 'programmes', se.id, { status: 'in_review' })) as {
      governance: { status: string }
    }
    expect(r.governance.status).toBe('in_review')
  })

  it('cannot approve or publish it (that is the head’s)', async () => {
    expect(await refusal(() => move(coordSe, 'programmes', se.id, { status: 'approved' }))).toBe(
      'TRANSITION_FORBIDDEN',
    )
  })

  it('cannot edit another programme of the same department', async () => {
    expect(await refusal(() => edit(coordSe, 'programmes', cs.id, { name: uniq('x') }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
  })

  it('cannot edit a programme of another department', async () => {
    expect(await refusal(() => edit(coordSe, 'programmes', foreign.id, { name: uniq('x') }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
  })

  it('cannot edit the department page', async () => {
    expect(await refusal(() => edit(coordSe, 'departments', dept.id, { name: uniq('x') }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
  })

  it('cannot create a programme or a department', async () => {
    expect(await can(() => makeProgramme(dept.id).then(() => null))).toBe(true) // control: admin can
    for (const [collection, data] of [
      ['programmes', { name: uniq('p'), department: dept.id, governance: { ownerOffice: office } }],
      ['departments', { name: uniq('d'), governance: { ownerOffice: office } }],
    ] as const) {
      expect(
        await can(() =>
          payload.create({ collection, draft: true, data: data as never, ...as(coordSe) }),
        ),
        collection,
      ).toBe(false)
    }
  })

  it('sees their own programme drafts and versions, not a sibling’s, not the department’s', async () => {
    const own = await payload.find({
      collection: 'programmes',
      draft: true,
      where: { id: { in: [se.id, cs.id, foreign.id] } },
      depth: 0,
      ...as(coordSe),
    })
    expect(own.docs.map((d) => d.id)).toEqual([se.id])
    const versions = await payload.findVersions({
      collection: 'programmes',
      where: { parent: { in: [se.id, cs.id, foreign.id] } },
      depth: 0,
      ...as(coordSe),
    })
    expect([...new Set(versions.docs.map((v) => String(v.parent)))]).toEqual([String(se.id)])
    // The department is a draft only the head sees: a coordinator gets the published ones only.
    const depts = await payload.find({
      collection: 'departments',
      draft: true,
      where: { id: { equals: dept.id } },
      depth: 0,
      ...as(coordSe),
    })
    expect(depts.docs).toHaveLength(0)
  })

  it('two coordinators are limited to their own programme each', async () => {
    await edit(coordCs, 'programmes', cs.id, { name: uniq('cs-edit') })
    expect(await refusal(() => edit(coordCs, 'programmes', se.id, { name: uniq('x') }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
  })

  it('an Editor of the whole office, with no programmes assigned, still edits every programme of it (control)', async () => {
    await edit(officeEditor, 'programmes', se.id, { name: uniq('by-office-editor') })
    await edit(officeEditor, 'programmes', cs.id, { name: uniq('by-office-editor') })
  })
})

describe('the head of the department', () => {
  it('sees the coordinator’s programme in review, approves, verifies and publishes it', async () => {
    await move(coordSe, 'programmes', se.id, { status: 'in_review' }).catch(() => null)
    const seen = await payload.find({
      collection: 'programmes',
      draft: true,
      where: { id: { equals: se.id } },
      depth: 0,
      ...as(hod),
    })
    expect(seen.docs).toHaveLength(1)
    await move(hod, 'programmes', se.id, { status: 'approved', verificationStatus: 'verified' })
    const live = await payload.update({
      collection: 'programmes',
      id: se.id,
      data: { _status: 'published', governance: {} } as never,
      ...as(hod),
    })
    expect((live as { governance?: { status?: string } }).governance?.status).toBe('published')
  })

  it('publishes the department page itself, with no one else reviewing it', async () => {
    const d = await makeDept(office)
    // The draft was started by the admin; the head edits and publishes it.
    await edit(hod, 'departments', d.id, { name: uniq('edited-by-head') })
    await move(hod, 'departments', d.id, { status: 'approved', verificationStatus: 'verified' })
    const live = await payload.update({
      collection: 'departments',
      id: d.id,
      data: { _status: 'published', governance: {} } as never,
      ...as(hod),
    })
    expect((live as { governance?: { status?: string } }).governance?.status).toBe('published')
  })

  it('reviews the department page and every programme of it', async () => {
    await move(hod, 'departments', dept.id, { status: 'approved', verificationStatus: 'verified' })
    await move(hod, 'programmes', cs.id, { status: 'approved', verificationStatus: 'verified' })
  })

  it('cannot touch a programme or a department of another department', async () => {
    expect(await refusal(() => edit(hod, 'programmes', foreign.id, { name: uniq('x') }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
    expect(await refusal(() => edit(hod, 'departments', otherDept.id, { name: uniq('x') }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
    expect(await refusal(() => edit(otherHod, 'programmes', se.id, { name: uniq('x') }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
  })
})

describe('the coordinator publishes what the head approved (slice 3aj)', () => {
  const publish = (user: User, collection: 'programmes' | 'departments', id: number, data = {}) =>
    payload.update({
      collection,
      id,
      data: { _status: 'published', governance: {}, ...data } as never,
      ...as(user),
    })
  const stage = async (id: number) =>
    (
      (await payload.findByID({
        collection: 'programmes',
        id,
        draft: true,
        depth: 0,
        overrideAccess: true,
      })) as { governance?: { status?: string } }
    ).governance?.status

  /** A fresh programme, owned by `coord`, sent for review. */
  async function inReview() {
    const p = await makeProgramme(dept.id)
    const coord = await coordinator([p.id])
    await edit(coord, 'programmes', p.id, { name: uniq('written') })
    await move(coord, 'programmes', p.id, { status: 'in_review' })
    return { p, coord }
  }

  it('writes, sends, the head approves and verifies, the coordinator publishes', async () => {
    const { p, coord } = await inReview()
    await move(hod, 'programmes', p.id, { status: 'approved', verificationStatus: 'verified' })
    expect(await stage(p.id)).toBe('approved')
    const live = await publish(coord, 'programmes', p.id)
    expect((live as { governance?: { status?: string } }).governance?.status).toBe('published')
    expect(await stage(p.id)).toBe('published')
  })

  it('cannot publish before the head approved: from draft or in review', async () => {
    const p = await makeProgramme(dept.id)
    const coord = await coordinator([p.id])
    // A draft cannot jump to Published at all; from review the coordinator may not take the step.
    expect(await refusal(() => publish(coord, 'programmes', p.id))).toBe('TRANSITION_ILLEGAL')
    await move(coord, 'programmes', p.id, { status: 'in_review' })
    expect(await refusal(() => publish(coord, 'programmes', p.id))).toMatch(/^TRANSITION_/)
  })

  it('cannot publish when approved but not yet verified', async () => {
    const { p, coord } = await inReview()
    await move(hod, 'programmes', p.id, { status: 'approved' })
    expect(await refusal(() => publish(coord, 'programmes', p.id))).toBe('NOT_VERIFIED')
  })

  it('cannot slip an edit into the publishing save', async () => {
    const { p, coord } = await inReview()
    await move(hod, 'programmes', p.id, { status: 'approved', verificationStatus: 'verified' })
    expect(await refusal(() => publish(coord, 'programmes', p.id, { name: uniq('sneaky') }))).toBe(
      'PUBLISH_CHANGED_CONTENT',
    )
  })

  it('an edit after approval sends it back to draft, and then it cannot be published', async () => {
    const { p, coord } = await inReview()
    await move(hod, 'programmes', p.id, { status: 'approved', verificationStatus: 'verified' })
    await edit(coord, 'programmes', p.id, { name: uniq('changed-after') })
    expect(await stage(p.id)).toBe('draft')
    expect(await refusal(() => publish(coord, 'programmes', p.id))).toBe('TRANSITION_ILLEGAL')
  })

  it('cannot take it offline or archive it afterwards', async () => {
    const { p, coord } = await inReview()
    await move(hod, 'programmes', p.id, { status: 'approved', verificationStatus: 'verified' })
    await publish(coord, 'programmes', p.id)
    expect(
      await refusal(() =>
        publish(coord, 'programmes', p.id, { governance: { status: 'archived' } }),
      ),
    ).toBe('TRANSITION_FORBIDDEN')
  })

  it('another coordinator, an office editor and the department page stay out', async () => {
    const { p } = await inReview()
    await move(hod, 'programmes', p.id, { status: 'approved', verificationStatus: 'verified' })
    expect(await refusal(() => publish(coordCs, 'programmes', p.id))).toBe('OWNER_OUT_OF_SCOPE')
    expect(await refusal(() => publish(officeEditor, 'programmes', p.id))).toBe(
      'TRANSITION_FORBIDDEN',
    )
    const d = await makeDept(office)
    await move(hod, 'departments', d.id, { status: 'approved', verificationStatus: 'verified' })
    expect(await refusal(() => publish(coordSe, 'departments', d.id))).toBe('OWNER_OUT_OF_SCOPE')
  })
})

describe('main pages are owned by the IT Directorate, so other offices are out of scope', () => {
  let page: { id: number }
  beforeAll(async () => {
    // The admin does not type an office: the default is the IT Directorate.
    page = (await payload.create({
      collection: 'pages',
      draft: true,
      data: { ...pageData({ source }), governance: { source } } as never,
      ...as(admin),
    })) as { id: number }
  })

  it('a page the admin creates without typing an office is owned by the IT Directorate', async () => {
    const row = (await payload.findByID({
      collection: 'pages',
      id: page.id,
      draft: true,
      depth: 0,
      overrideAccess: true,
    })) as { governance?: { ownerOffice?: string } }
    expect(row.governance?.ownerOffice).toBe('it directorate')
  })

  it('the admin and the site manager edit it', async () => {
    await edit(admin, 'pages', page.id, { title: uniq('by-admin') })
    await edit(manager, 'pages', page.id, { title: uniq('by-manager') })
  })

  it('a head of department, an office editor and a coordinator cannot edit it', async () => {
    for (const [who, label] of [
      [hod, 'head of department'],
      [officeEditor, 'office editor'],
      [coordSe, 'coordinator'],
    ] as const) {
      expect(await refusal(() => edit(who, 'pages', page.id, { title: uniq('x') })), label).toBe(
        'OWNER_OUT_OF_SCOPE',
      )
    }
    expect(await refusal(() => move(hod, 'pages', page.id, { status: 'approved' }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
  })

  it('a head of department does not see its unpublished draft', async () => {
    const find = (who: User) =>
      payload.find({
        collection: 'pages',
        draft: true,
        where: { id: { equals: page.id } },
        depth: 0,
        ...as(who),
      })
    expect((await find(hod)).docs).toHaveLength(0)
    expect((await find(admin)).docs).toHaveLength(1)
  })

  it('the system actor (importer, seeds) still works on pages', async () => {
    const row = await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData({ ownerOffice: office, source }) as never,
      ...system,
    })
    expect(row.id).toBeTruthy()
  })
})

describe('who makes the accounts', () => {
  const account = (extra: Record<string, unknown>) => ({
    email: `${uniq('coord')}@example.test`,
    password: 'correct-horse-battery-staple',
    name: 'Coordinator (test)',
    ...extra,
  })
  const createAs = (who: User, extra: Record<string, unknown>) =>
    payload.create({ collection: 'users', data: account(extra) as never, ...as(who) }) as Promise<
      User & { programmes?: unknown[] }
    >

  it('a head creates a coordinator for a programme of their own department', async () => {
    const u = await createAs(hod, { role: 'editor', offices: [office], programmes: [cs.id] })
    expect(u.role).toBe('editor')
    const back = await reload(u)
    expect((back as { programmes?: unknown[] }).programmes).toEqual([cs.id])
    // And that account is limited to that programme.
    await edit(back, 'programmes', cs.id, { name: uniq('by-new-coordinator') })
    expect(await refusal(() => edit(back, 'programmes', se.id, { name: uniq('x') }))).toBe(
      'OWNER_OUT_OF_SCOPE',
    )
  })

  it('a head cannot give a programme of another department', async () => {
    expect(
      await refusal(() =>
        createAs(hod, { role: 'editor', offices: [office], programmes: [foreign.id] }),
      ),
    ).toBe('TEAM_PROGRAMME_FORBIDDEN')
  })

  it('programmes go only to an Editor', async () => {
    expect(
      await refusal(() =>
        createAs(hod, { role: 'contributor', offices: [office], programmes: [se.id] }),
      ),
    ).toBe('TEAM_PROGRAMME_FORBIDDEN')
  })

  it('a head changes the programmes of a team member, and cannot reach one of another department', async () => {
    const u = await createAs(hod, { role: 'editor', offices: [office] })
    await payload.update({
      collection: 'users',
      id: u.id,
      data: { programmes: [se.id] } as never,
      ...as(hod),
    })
    expect(((await reload(u)) as { programmes?: unknown[] }).programmes).toEqual([se.id])
    expect(
      await refusal(() =>
        payload.update({
          collection: 'users',
          id: u.id,
          data: { programmes: [foreign.id] } as never,
          ...as(hod),
        }),
      ),
    ).toBe('TEAM_PROGRAMME_FORBIDDEN')
    expect(
      await refusal(() =>
        payload.update({
          collection: 'users',
          id: u.id,
          data: { programmes: [se.id] } as never,
          ...as(otherHod),
        }),
      ),
    ).not.toBeNull() // refused by the account rules before the field is looked at
    expect(((await reload(u)) as { programmes?: unknown[] }).programmes).toEqual([se.id])
  })

  it('a coordinator cannot widen their own programmes', async () => {
    await payload.update({
      collection: 'users',
      id: coordSe.id,
      data: { programmes: [se.id, cs.id] } as never,
      ...as(coordSe),
    })
    expect(((await reload(coordSe)) as { programmes?: unknown[] }).programmes).toEqual([se.id])
  })

  it('the platform admin can assign any programme', async () => {
    const u = await createAs(admin, { role: 'editor', offices: [office], programmes: [foreign.id] })
    expect(((await reload(u)) as { programmes?: unknown[] }).programmes).toEqual([foreign.id])
  })
})
