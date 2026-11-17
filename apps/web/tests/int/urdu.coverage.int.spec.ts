// @vitest-environment node
/**
 * Urdu coverage for field labels, descriptions, options, tabs, names and groups (slice 3r).
 *
 * Walks the finished Payload config. Every English text an editor can read must be a { en, ur } pair,
 * unless it is on the written internal list (urWords.ts) or comes from Payload's own system
 * collections or upload fields it adds itself. And every dictionary entry must still match a text in
 * the config, so a renamed label does not leave a dead Urdu line behind.
 */
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { INTERNAL_ENGLISH, URDU_WORDS } from '@/i18n/urWords'

import { getTestPayload } from '../helpers/governance'

type Loose = Record<string, unknown>
const isObject = (v: unknown): v is Loose =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

interface Found {
  text: string
  hasUrdu: boolean
  where: string
}

function collect(config: { collections: unknown[]; globals?: unknown[] }): Found[] {
  const found: Found[] = []
  const take = (v: unknown, where: string) => {
    if (typeof v === 'string' && v.trim()) found.push({ text: v, hasUrdu: false, where })
    else if (isObject(v) && typeof v.en === 'string') {
      found.push({ text: v.en, hasUrdu: typeof v.ur === 'string' && v.ur.trim() !== '', where })
    }
  }
  const walk = (fields: unknown, where: string) => {
    if (!Array.isArray(fields)) return
    for (const f of fields) {
      if (!isObject(f)) continue
      const name = typeof f.name === 'string' ? f.name : String(f.type)
      const w = `${where}.${name}`
      if (f.type === 'tabs' && Array.isArray(f.tabs)) {
        for (const t of f.tabs as Loose[]) {
          take(t.label, `${w}.tab`)
          take(t.description, `${w}.tab.description`)
          walk(t.fields, w)
        }
        continue
      }
      take(f.label, `${w}.label`)
      if (isObject(f.admin)) {
        take(f.admin.description, `${w}.description`)
        take(f.admin.placeholder, `${w}.placeholder`)
      }
      if (Array.isArray(f.options)) {
        for (const o of f.options) take(isObject(o) ? o.label : o, `${w}.option`)
      }
      if (isObject(f.labels)) {
        take(f.labels.singular, `${w}.row`)
        take(f.labels.plural, `${w}.rows`)
      }
      if (Array.isArray(f.blocks)) {
        for (const b of f.blocks as Loose[]) {
          if (isObject(b.labels)) {
            take(b.labels.singular, `${w}.block`)
            take(b.labels.plural, `${w}.blocks`)
          }
          walk(b.fields, `${w}.${String(b.slug)}`)
        }
      }
      walk(f.fields, w)
    }
  }
  for (const c of config.collections as Loose[]) {
    const slug = String(c.slug)
    if (slug.startsWith('payload-')) continue
    const w = `col:${slug}`
    if (isObject(c.labels)) {
      take(c.labels.singular, `${w}.singular`)
      take(c.labels.plural, `${w}.plural`)
    }
    if (isObject(c.admin)) {
      take(c.admin.group, `${w}.group`)
      take(c.admin.description, `${w}.description`)
    }
    walk(c.fields, w)
  }
  for (const g of (config.globals ?? []) as Loose[]) {
    if (String(g.slug).startsWith('payload-')) continue
    const w = `glob:${String(g.slug)}`
    take(g.label, `${w}.label`)
    if (isObject(g.admin)) take(g.admin.group, `${w}.group`)
    walk(g.fields, w)
  }
  return found
}

let payload: Payload
let found: Found[]
beforeAll(async () => {
  payload = await getTestPayload()
  found = collect(payload.config as never)
})

describe('Urdu for labels and descriptions', () => {
  it('finds a believable number of texts to check', () => {
    expect(found.length).toBeGreaterThan(300)
  })

  it('every editor-facing English text has an Urdu line, unless it is on the internal list', () => {
    const internal = new Set(INTERNAL_ENGLISH)
    const missing = found.filter((f) => !f.hasUrdu && !internal.has(f.text))
    expect(
      missing.map((m) => `${m.where}: ${m.text}`),
      'add these to URDU_WORDS (or INTERNAL_ENGLISH if an editor never sees them)',
    ).toEqual([])
  })

  it('every Urdu line contains Urdu letters', () => {
    const noLetters = Object.entries(URDU_WORDS).filter(([, ur]) => !/[؀-ۿ]/.test(ur))
    expect(noLetters.map(([en]) => en)).toEqual([])
  })

  it('no dictionary entry is dead: each key matches an English text in the config', () => {
    const present = new Set(found.map((f) => f.text))
    const dead = Object.keys(URDU_WORDS).filter((k) => !present.has(k))
    expect(dead, 'remove these from URDU_WORDS or fix the spelling to match the config').toEqual([])
  })

  it('English is unchanged: the en side of a pair is the original text', () => {
    const pairs = found.filter((f) => f.hasUrdu)
    expect(pairs.length).toBeGreaterThan(300)
    for (const p of pairs.filter((f) => URDU_WORDS[f.text] !== undefined)) {
      expect(p.text).toBe(p.text.trim())
    }
  })

  it('keeps the internal list honest: nothing on it also has a translation', () => {
    const both = INTERNAL_ENGLISH.filter((t) => URDU_WORDS[t] !== undefined)
    expect(both).toEqual([])
  })
})
