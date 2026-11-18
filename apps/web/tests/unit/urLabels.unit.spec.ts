import type { Config } from 'payload'
import { describe, expect, it } from 'vitest'

import { applyUrduLabels, wrap } from '@/i18n/urLabels'

const words = {
  Title: 'عنوان',
  Notice: 'نوٹس',
  Notices: 'نوٹسز',
  'Short Summary': 'مختصر خلاصہ',
  Yes: 'ہاں',
  Rows: 'قطاریں',
  Row: 'قطار',
  Hero: 'مرکزی حصہ',
  Content: 'مواد',
  'Date shown': 'تاریخ',
  Header: 'ہیڈر',
}

const config = (extra: Partial<Config> = {}): Config =>
  ({
    secret: 's',
    collections: [
      {
        slug: 'notices',
        labels: { singular: 'Notice', plural: 'Notices' },
        admin: { group: 'Content', description: 'Title' },
        fields: [
          { name: 'title', type: 'text' },
          { name: 'shortSummary', type: 'textarea', admin: { description: 'Title' } },
          { name: 'kept', type: 'text', label: 'Not in the dictionary' },
          { name: 'fn', type: 'text', label: (() => 'x') as never },
          { name: 'off', type: 'text', label: false },
          { name: 'done', type: 'text', label: { en: 'Title', ur: 'پہلے سے' } },
          { name: 'choice', type: 'select', options: [{ label: 'Yes', value: 'y' }, 'plain'] },
          { name: 'rows', type: 'array', fields: [{ name: 'title', type: 'text' }] },
          {
            type: 'tabs',
            tabs: [{ name: 'hero', fields: [{ name: 'inner', type: 'text', label: 'Title' }] }],
          },
          { type: 'row', fields: [{ name: 'nested', type: 'text', label: 'Title' }] },
        ],
      },
    ],
    globals: [{ slug: 'header', fields: [{ name: 'x', type: 'text', label: 'Title' }] }],
    ...extra,
  }) as unknown as Config

describe('urduLabels', () => {
  it('wraps a known string as { en, ur } and leaves an unknown string alone', () => {
    expect(wrap('Title', words)).toEqual({ en: 'Title', ur: 'عنوان' })
    expect(wrap('Nothing like it', words)).toBe('Nothing like it')
    const fn = () => 'x'
    expect(wrap(fn, words)).toBe(fn)
  })

  it('names a field after its name when it has no label, the way Payload does', () => {
    const out = applyUrduLabels(config(), words) as never as {
      collections: { fields: Record<string, unknown>[] }[]
    }
    const fields = out.collections[0].fields
    expect(fields[0].label).toEqual({ en: 'Title', ur: 'عنوان' })
    expect(fields[1].label).toEqual({ en: 'Short Summary', ur: 'مختصر خلاصہ' })
  })

  it('translates collection names, groups, descriptions, options, tabs, row labels and globals', () => {
    const out = applyUrduLabels(config(), words) as never as {
      collections: {
        labels: unknown
        admin: Record<string, unknown>
        fields: Record<string, unknown>[]
      }[]
      globals: { label: unknown; fields: Record<string, unknown>[] }[]
    }
    const c = out.collections[0]
    expect(c.labels).toEqual({
      singular: { en: 'Notice', ur: 'نوٹس' },
      plural: { en: 'Notices', ur: 'نوٹسز' },
    })
    expect(c.admin.group).toEqual({ en: 'Content', ur: 'مواد' })
    expect(c.admin.description).toEqual({ en: 'Title', ur: 'عنوان' })
    expect((c.fields[1].admin as Record<string, unknown>).description).toEqual({
      en: 'Title',
      ur: 'عنوان',
    })
    expect(c.fields[6].options).toEqual([{ label: { en: 'Yes', ur: 'ہاں' }, value: 'y' }, 'plain'])
    expect(c.fields[7].labels).toEqual({
      singular: { en: 'Row', ur: 'قطار' },
      plural: { en: 'Rows', ur: 'قطاریں' },
    })
    const tab = (c.fields[8].tabs as Record<string, unknown>[])[0]
    expect(tab.label).toEqual({ en: 'Hero', ur: 'مرکزی حصہ' })
    expect((tab.fields as Record<string, unknown>[])[0].label).toEqual({ en: 'Title', ur: 'عنوان' })
    expect((c.fields[9].fields as Record<string, unknown>[])[0].label).toEqual({
      en: 'Title',
      ur: 'عنوان',
    })
    expect(out.globals[0].label).toEqual({ en: 'Header', ur: 'ہیڈر' })
    expect(out.globals[0].fields[0].label).toEqual({ en: 'Title', ur: 'عنوان' })
  })

  it('leaves unknown labels, functions, switched-off labels and existing pairs exactly as they were', () => {
    const out = applyUrduLabels(config(), words) as never as {
      collections: { fields: Record<string, unknown>[] }[]
    }
    const f = out.collections[0].fields
    expect(f[2].label).toBe('Not in the dictionary')
    expect(typeof f[3].label).toBe('function')
    expect(f[4].label).toBe(false)
    expect(f[5].label).toEqual({ en: 'Title', ur: 'پہلے سے' })
  })

  it('does not change the config it is given', () => {
    const input = config()
    const before = JSON.stringify(input)
    applyUrduLabels(input, words)
    expect(JSON.stringify(input)).toBe(before)
  })
})
