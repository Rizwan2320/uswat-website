import { describe, expect, it } from 'vitest'

import { describeUse, referenceFields, whereReferences } from '@/governance/references'

const collections = [
  {
    slug: 'people',
    fields: [
      { name: 'department', type: 'relationship', relationTo: 'departments' },
      { name: 'createdBy', type: 'relationship', relationTo: 'users' },
    ],
  },
  {
    slug: 'programmes',
    fields: [
      { name: 'department', type: 'relationship', relationTo: 'departments' },
      {
        name: 'meta',
        type: 'group',
        fields: [{ name: 'owner', type: 'relationship', relationTo: ['departments', 'offices'] }],
      },
      {
        name: 'rows',
        type: 'array',
        fields: [{ name: 'dept', type: 'relationship', relationTo: 'departments', hasMany: true }],
      },
      {
        type: 'tabs',
        tabs: [
          {
            name: 'extra',
            fields: [{ name: 'd', type: 'relationship', relationTo: 'departments' }],
          },
          { label: 'Plain', fields: [{ name: 'e', type: 'upload', relationTo: 'departments' }] },
        ],
      },
      { type: 'row', fields: [{ name: 'r', type: 'relationship', relationTo: 'departments' }] },
      {
        name: 'layout',
        type: 'blocks',
        blocks: [
          {
            slug: 'b',
            fields: [{ name: 'link', type: 'relationship', relationTo: 'departments' }],
          },
        ],
      },
      {
        name: 'breadcrumbs',
        type: 'array',
        fields: [{ name: 'doc', type: 'relationship', relationTo: 'departments' }],
      },
    ],
  },
  { slug: 'search', fields: [{ name: 'doc', type: 'relationship', relationTo: ['departments'] }] },
  {
    slug: 'payload-locked-documents',
    fields: [{ name: 'x', type: 'relationship', relationTo: 'departments' }],
  },
  { slug: 'audit-logs', fields: [{ name: 'x', type: 'relationship', relationTo: 'departments' }] },
  { slug: 'departments', fields: [{ name: 'head', type: 'relationship', relationTo: 'people' }] },
]

describe('referenceFields', () => {
  it('finds every kind of field that can hold a link, with its dotted path', () => {
    const paths = referenceFields(collections, 'departments').map(
      (r) => `${r.collection}:${r.path}`,
    )
    expect(paths.sort()).toEqual(
      [
        'people:department',
        'programmes:department',
        'programmes:meta.owner',
        'programmes:rows.dept',
        'programmes:extra.d',
        'programmes:e',
        'programmes:r',
        'programmes:layout.link',
      ].sort(),
    )
  })

  it('marks polymorphic and many-valued fields', () => {
    const refs = referenceFields(collections, 'departments')
    expect(refs.find((r) => r.path === 'meta.owner')?.polymorphic).toBe(true)
    expect(refs.find((r) => r.path === 'rows.dept')?.hasMany).toBe(true)
    expect(refs.find((r) => r.path === 'department')?.polymorphic).toBe(false)
  })

  it('leaves out users, the audit log, search, Payload system collections and derived fields', () => {
    expect(referenceFields(collections, 'users')).toEqual([])
    const all = referenceFields(collections, 'departments').map((r) => r.collection)
    expect(all).not.toContain('search')
    expect(all).not.toContain('audit-logs')
    expect(all).not.toContain('payload-locked-documents')
    expect(
      referenceFields(collections, 'departments').some((r) => r.path.includes('breadcrumbs')),
    ).toBe(false)
  })

  it('finds a link the other way round (a department points at its head)', () => {
    expect(referenceFields(collections, 'people')).toEqual([
      { collection: 'departments', path: 'head', polymorphic: false, hasMany: false },
    ])
  })
})

describe('whereReferences', () => {
  it('builds a plain match, a polymorphic match, and ignores the record itself', () => {
    const plain = { collection: 'people', path: 'department', polymorphic: false, hasMany: false }
    expect(whereReferences(plain, 'departments', 5)).toEqual({ department: { equals: 5 } })
    const poly = { collection: 'programmes', path: 'meta.owner', polymorphic: true, hasMany: false }
    expect(whereReferences(poly, 'departments', 5)).toEqual({
      'meta.owner': { equals: { relationTo: 'departments', value: 5 } },
    })
    const self = { collection: 'categories', path: 'parent', polymorphic: false, hasMany: false }
    expect(whereReferences(self, 'categories', 5, 5)).toEqual({
      and: [{ parent: { equals: 5 } }, { id: { not_equals: 5 } }],
    })
  })
})

describe('describeUse', () => {
  it('names the biggest first and reads naturally', () => {
    expect(describeUse([])).toBe('')
    expect(describeUse([{ collection: 'people', label: 'People', count: 12 }])).toBe('12 People')
    expect(describeUse([{ collection: 'people', label: 'People', count: 1 }])).toBe('1 Person')
    expect(
      describeUse([
        { collection: 'programmes', label: 'Programmes', count: 4 },
        { collection: 'people', label: 'People', count: 12 },
        { collection: 'pages', label: 'Pages', count: 1 },
      ]),
    ).toBe('12 People, 4 Programmes and 1 Page')
  })
})
