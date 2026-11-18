import { describe, expect, it } from 'vitest'

import { contacts } from '../../../../scripts/import/seeds/contacts'
import { SAMPLE_HOST } from '../../../../scripts/import/seeds/data'
import { groupBySection, telHref, toContactEntry } from '../../src/site/directory/shape'

const real = { id: 1, section: 'Admin', name: 'Registrar', hours: '9 to 5', phones: [{ number: '+92 (946) 123-456' }, { number: '  ' }], email: 'r@uswat.example', governance: { source: 'https://uswat.edu.pk/contact-list/' } }

describe('telHref', () => {
  it('keeps digits and a leading plus only', () => {
    expect(telHref('+92 (946) 123-456')).toBe('tel:+92946123456')
    expect(telHref('0946 123456')).toBe('tel:0946123456')
  })
  it('gives no link when too little to dial is left', () => {
    expect(telHref('ext')).toBeNull()
    expect(telHref('12')).toBeNull()
  })
})

describe('contact entry', () => {
  it('links a real entry and drops an empty phone', () => {
    expect(toContactEntry(real)).toEqual({
      id: 1,
      section: 'Admin',
      name: 'Registrar',
      hours: '9 to 5',
      phones: [{ text: '+92 (946) 123-456', href: 'tel:+92946123456' }],
      email: 'r@uswat.example',
      emailHref: 'mailto:r@uswat.example',
      sample: false,
    })
  })
  it('shows a Sample entry as plain text, never as a link', () => {
    const e = toContactEntry({ ...real, governance: { source: `https://${SAMPLE_HOST}/seed/contact-directory/x` } })
    expect(e?.sample).toBe(true)
    expect(e?.phones[0].href).toBeNull()
    expect(e?.emailHref).toBeNull()
    expect(e?.email).toBe('r@uswat.example')
  })
  it('keeps an entry that has only a name and a section, and refuses one without either', () => {
    expect(toContactEntry({ id: 2, section: 'S', name: 'N' })).toMatchObject({ phones: [], email: null, emailHref: null, hours: null })
    expect(toContactEntry({ id: 3, section: '', name: 'N' })).toBeNull()
    expect(toContactEntry({ id: 4, section: 'S', name: '' })).toBeNull()
  })
  it('refuses an email that does not make a safe link but still shows it', () => {
    const e = toContactEntry({ ...real, email: 'bad address' })
    expect(e?.email).toBe('bad address')
  })
})

describe('grouping', () => {
  it('orders sections and then names, keeps a repeated name, and gives each section an id', () => {
    const mk = (id: number, section: string, name: string) => toContactEntry({ id, section, name })!
    const g = groupBySection([mk(1, 'B', 'Zed'), mk(2, 'A', 'Two'), mk(3, 'B', 'Alpha'), mk(4, 'A', 'Two')])
    expect(g.map((x) => x.section)).toEqual(['A', 'B'])
    expect(g[0].entries.map((e) => e.id)).toEqual([2, 4])
    expect(g[1].entries.map((e) => e.name)).toEqual(['Alpha', 'Zed'])
    expect(new Set(g.map((x) => x.id)).size).toBe(2)
  })
})

describe('Sample contact seeds', () => {
  it('are invented: marked Sample, numbers are the placeholder +00 000 000000n, addresses are on sample.invalid, keys are unique', () => {
    expect(new Set(contacts.map((c) => c.key)).size).toBe(contacts.length)
    for (const c of contacts) {
      expect(c.name.startsWith('Sample'), c.name).toBe(true)
      expect(c.section.startsWith('Sample'), c.section).toBe(true)
      for (const p of c.phones) expect(p, p).toMatch(/^\+00 000 000000\d$/)
      if (c.email) expect(c.email.endsWith(`@${SAMPLE_HOST}`)).toBe(true)
    }
  })
})
