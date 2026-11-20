import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  affectsPublic,
  hasGovernance,
  revalidateGoverned,
  tagsFor,
  typeName,
} from '../../src/plugins/revalidateOnChange'

describe('tagsFor', () => {
  it('names the list and the item, and always the sitemap', () => {
    expect(tagsFor('notices', 7)).toEqual(['list:notices', 'item:notices:7', 'content-sitemap'])
  })
  it('calls the posts collection "news", as the site does', () => {
    expect(typeName('posts')).toBe('news')
    expect(tagsFor('posts', 3)).toEqual(['list:news', 'item:news:3', 'content-sitemap'])
  })
  it('skips the item tag when there is no id', () => {
    expect(tagsFor('events', undefined)).toEqual(['list:events', 'content-sitemap'])
  })
})

describe('affectsPublic', () => {
  it('publish, edit of a live record and unpublish count; a draft does not', () => {
    expect(affectsPublic({ _status: 'published' }, { _status: 'draft' })).toBe(true)
    expect(affectsPublic({ _status: 'published' }, { _status: 'published' })).toBe(true)
    expect(affectsPublic({ _status: 'draft' }, { _status: 'published' })).toBe(true)
    expect(affectsPublic({ _status: 'draft' }, { _status: 'draft' })).toBe(false)
    expect(affectsPublic({ _status: 'draft' }, undefined)).toBe(false)
  })
  it('a collection with no draft stage is always live', () => {
    expect(affectsPublic({}, {})).toBe(true)
    expect(affectsPublic({}, undefined)).toBe(true)
  })
})

type Out = { collections: Array<{ hooks?: { afterChange?: unknown[]; afterDelete?: unknown[] } }> }
const run = (collections: unknown[]): Out =>
  (revalidateGoverned as unknown as (c: unknown) => Out)({ collections })

describe('revalidateGoverned plugin', () => {
  const governed = { slug: 'notices', fields: [{ type: 'group', name: 'governance', fields: [] }] }
  const plain = { slug: 'categories', fields: [{ type: 'text', name: 'title' }] }
  const out = run([governed, plain])

  it('finds governed collections by their governance group', () => {
    expect(hasGovernance(governed as never)).toBe(true)
    expect(hasGovernance(plain as never)).toBe(false)
  })
  it('adds one change hook and one delete hook to governed collections only, keeping existing ones', () => {
    expect(out.collections[0].hooks?.afterChange).toHaveLength(1)
    expect(out.collections[0].hooks?.afterDelete).toHaveLength(1)
    expect(out.collections[1].hooks).toBeUndefined()
    const existing = () => undefined
    const again = run([{ ...governed, hooks: { afterChange: [existing] } }])
    expect(again.collections[0]?.hooks?.afterChange?.[0]).toBe(existing)
    expect(again.collections[0].hooks?.afterChange).toHaveLength(2)
  })
})

// P3w-c: every `list:` tag the public site reads has a collection that refreshes it.
describe('tags the site reads', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f)
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : []
    })
  const files = walk(join(__dirname, '../../src/site'))
  const literal = new Set<string>()
  let usesTypeTag = false
  for (const f of files) {
    const text = readFileSync(f, 'utf8')
    for (const m of text.matchAll(/'list:([a-z-]+)'/g)) literal.add(m[1])
    if (/`list:\$\{type\}`/.test(text)) usesTypeTag = true
  }
  const governedSlugs = [
    'posts', 'notices', 'events', 'jobs', 'tenders', 'departments', 'programmes', 'people',
    'contact-directory', 'offices', 'campuses', 'merit-lists', 'affiliated-colleges',
  ]
  it('finds the tags (so this test cannot pass by searching nothing)', () => {
    expect(literal.size).toBeGreaterThanOrEqual(3)
    expect(usesTypeTag).toBe(true)
  })
  it('each literal list tag is emitted for a governed collection', () => {
    const emitted = new Set(governedSlugs.map((s) => `list:${typeName(s)}`))
    for (const t of literal) expect(emitted.has(`list:${t}`), `list:${t}`).toBe(true)
  })
  it('each article type tag (list:{type}) is emitted', () => {
    const cfg = readFileSync(join(__dirname, '../../src/site/articles/config.ts'), 'utf8')
    const types = [...cfg.matchAll(/^  ([a-z]+): \{\n\s+path:/gm)].map((m) => m[1])
    expect(types.length).toBeGreaterThanOrEqual(5)
    const emitted = new Set(governedSlugs.map((s) => typeName(s)))
    for (const t of types) expect(emitted.has(t), t).toBe(true)
  })
})
