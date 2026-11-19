// @vitest-environment node
/**
 * Slice 3s: a record that other records still use cannot be deleted, by anyone (docs/briefs/p3s-integrity.md).
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

import { referenceFields } from '../../src/governance/references'
import type { User } from '../../src/payload-types'
import { as, getTestPayload, makeUser, pageData, system, uniq } from '../helpers/governance'

let payload: Payload
let admin: User

const gov = () => ({ ownerOffice: 'Registrar', source: 'https://example.test/source' })
const make = (collection: 'departments' | 'people', extra: Record<string, unknown> = {}) =>
  payload.create({
    collection,
    draft: true,
    data: { name: uniq(collection), governance: gov(), ...extra } as never,
    ...system,
  }) as Promise<{ id: number }>
const tryDelete = async (collection: 'departments' | 'people' | 'pages', id: number) => {
  try {
    await payload.delete({ collection, id, ...as(admin) })
    return { ok: true as const }
  } catch (e) {
    const err = e as { message: string; data?: { code?: string } }
    return { ok: false as const, code: err.data?.code, message: err.message }
  }
}

beforeAll(async () => {
  payload = await getTestPayload()
  admin = await makeUser(payload, 'platformAdmin')
})

describe('fields that can point at a record, read from the real config', () => {
  it('finds the known links to departments, enough for media, and none for users', () => {
    const cols = payload.config.collections
    const dept = referenceFields(cols, 'departments')
    const media = referenceFields(cols, 'media')
    const names = (refs: { collection: string; path: string }[]) =>
      refs.map((r) => `${r.collection}.${r.path}`)
    expect(names(dept)).toEqual(
      expect.arrayContaining(['people.department', 'programmes.department']),
    )
    expect(media.length, names(media).join(', ')).toBeGreaterThanOrEqual(6)
    expect(referenceFields(cols, 'users')).toEqual([])
  })
})

describe('delete is refused while something still uses the record', () => {
  it('a department with people pointing at it cannot be deleted, and the message counts them', async () => {
    const dept = await make('departments')
    const a = await make('people', { department: dept.id })
    const b = await make('people', { department: dept.id })
    const res = await tryDelete('departments', dept.id)
    expect(res).toMatchObject({ ok: false, code: 'IN_USE' })
    expect((res as { message: string }).message).toContain('2 People')
    // Remove the links, then it can go.
    await payload.delete({ collection: 'people', id: a.id, ...system })
    expect(await tryDelete('departments', dept.id)).toMatchObject({ ok: false, code: 'IN_USE' })
    await payload.delete({ collection: 'people', id: b.id, ...system })
    expect(await tryDelete('departments', dept.id)).toEqual({ ok: true })
  })

  it('works the other way: a person who is a department head cannot be deleted', async () => {
    const person = await make('people')
    const dept = await make('departments', { head: person.id })
    const res = await tryDelete('people', person.id)
    expect(res).toMatchObject({ ok: false, code: 'IN_USE' })
    expect((res as { message: string }).message).toContain('1 Department')
    await payload.update({
      collection: 'departments',
      id: dept.id,
      draft: true,
      data: { head: null } as never,
      ...system,
    })
    expect(await tryDelete('people', person.id)).toEqual({ ok: true })
  })

  it('a page that another page links to, or a redirect points at, cannot be deleted', async () => {
    const target = (await payload.create({
      collection: 'pages',
      draft: true,
      data: pageData() as never,
      ...system,
    })) as { id: number }
    const linking = (await payload.create({
      collection: 'pages',
      draft: true,
      data: {
        ...pageData(),
        layout: [
          {
            blockType: 'cta',
            richText: null,
            links: [
              {
                link: {
                  type: 'reference',
                  label: 'Read more',
                  reference: { relationTo: 'pages', value: target.id },
                },
              },
            ],
          },
        ],
      } as never,
      ...system,
    })) as { id: number }
    const res = await tryDelete('pages', target.id)
    expect(res).toMatchObject({ ok: false, code: 'IN_USE' })
    expect((res as { message: string }).message).toContain('1 Page')
    await payload.delete({ collection: 'pages', id: linking.id, ...system })

    const redirect = (await payload.create({
      collection: 'redirects',
      data: {
        from: `/old-${uniq('r')}`,
        to: { type: 'reference', reference: { relationTo: 'pages', value: target.id } },
      } as never,
      ...system,
    })) as { id: number }
    const viaRedirect = await tryDelete('pages', target.id)
    expect(viaRedirect).toMatchObject({ ok: false, code: 'IN_USE' })
    expect((viaRedirect as { message: string }).message).toMatch(/Redirect/)
    await payload.delete({ collection: 'redirects', id: redirect.id, ...system })
    expect(await tryDelete('pages', target.id)).toEqual({ ok: true })
  })

  it('an item nothing uses is still deleted normally', async () => {
    const dept = await make('departments')
    expect(await tryDelete('departments', dept.id)).toEqual({ ok: true })
  })

  it('the permission check comes first: a person who may not delete is not told what uses it', async () => {
    const dept = await make('departments')
    await make('people', { department: dept.id })
    const auditor = await makeUser(payload, 'auditor')
    let code: string | undefined
    let message = ''
    try {
      await payload.delete({ collection: 'departments', id: dept.id, ...as(auditor) })
    } catch (e) {
      const err = e as { message: string; data?: { code?: string } }
      code = err.data?.code
      message = err.message
    }
    expect(code).not.toBe('IN_USE')
    expect(message).not.toMatch(/People/)
  })
})
