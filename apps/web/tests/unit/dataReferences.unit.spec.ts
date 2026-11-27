import { describe, expect, it } from 'vitest'

import { dataReferences, describeUse } from '@/governance/references'

const fields = [
  {
    name: 'slides',
    type: 'array',
    fields: [{ name: 'image', type: 'upload', relationTo: 'media' }],
  },
  { name: 'logo', type: 'upload', relationTo: 'media', localized: true },
  { name: 'links', type: 'relationship', relationTo: ['pages', 'media'], hasMany: true },
  {
    name: 'about',
    type: 'group',
    fields: [{ name: 'photo', type: 'upload', relationTo: 'media' }],
  },
  {
    name: 'layout',
    type: 'blocks',
    blocks: [{ slug: 'hero', fields: [{ name: 'picture', type: 'upload', relationTo: 'media' }] }],
  },
  {
    type: 'tabs',
    tabs: [{ name: 'seo', fields: [{ name: 'ogImage', type: 'upload', relationTo: 'media' }] }],
  },
]
const hit = (data: unknown, id: number | string = 7) => dataReferences(fields, data, 'media', id)

describe('dataReferences', () => {
  it('finds a picture in an array row, by id or populated', () => {
    expect(hit({ slides: [{ image: 3 }, { image: 7 }] })).toBe(true)
    expect(hit({ slides: [{ image: { id: 7 } }] })).toBe(true)
    expect(hit({ slides: [{ image: 3 }] })).toBe(false)
  })
  it('compares ids as text, so 7 and "7" are the same picture', () => {
    expect(hit({ slides: [{ image: '7' }] })).toBe(true)
  })
  it('finds a picture in a group, a block row and a named tab', () => {
    expect(hit({ about: { photo: 7 } })).toBe(true)
    expect(hit({ layout: [{ blockType: 'hero', picture: 7 }] })).toBe(true)
    expect(hit({ seo: { ogImage: 7 } })).toBe(true)
  })
  it('checks every language of a localized field', () => {
    expect(hit({ logo: { en: 1, ur: 7 } })).toBe(true)
    expect(hit({ logo: { en: 1, ur: 2 } })).toBe(false)
  })
  it('reads a link that can point at several collections only when it points at this one', () => {
    expect(hit({ links: [{ relationTo: 'pages', value: 7 }] })).toBe(false)
    expect(hit({ links: [{ relationTo: 'media', value: 7 }] })).toBe(true)
  })
  it('is false for empty, missing or null data', () => {
    expect(hit({})).toBe(false)
    expect(hit(null)).toBe(false)
    expect(hit({ slides: null, about: null })).toBe(false)
  })
})

describe('describeUse with a global', () => {
  it('names the global and puts it after the counted collections', () => {
    expect(
      describeUse([
        { collection: 'home-content', count: 1, label: 'Home page content', global: true },
        { collection: 'people', count: 2, label: 'People' },
      ]),
    ).toBe('2 People and the Home page content')
  })
})
