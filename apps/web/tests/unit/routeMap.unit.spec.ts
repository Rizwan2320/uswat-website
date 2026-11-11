import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  buildRules,
  canonicalTarget,
  legacyKey,
  parseCsv,
  readRows,
  resolveLegacy,
  type LegacyRules,
} from '@/legacy/routeMap'
import generated from '@/legacy/routeMap.generated.json'

const csv = readFileSync(path.resolve(process.cwd(), '../../scripts/import/data/route_map.csv'), 'utf8')

/** Paths the new site already serves (src/app). An old address that lands on one would shadow it. */
const RESERVED = [
  '/admin', '/api', '/posts', '/search', '/design', '/healthz', '/readyz', '/next', '/portal', '/portal-api',
  '/pages-sitemap.xml', '/posts-sitemap.xml', '/sitemap.xml', '/robots.txt', '/media', '/_next',
]
const isReserved = (key: string) => key === '/' || RESERVED.some((r) => key === r || key.startsWith(`${r}/`))

describe('legacyKey', () => {
  it('treats escape case, trailing slash, host, query and fragment as the same address', () => {
    const k = '/2026/11/%f0%9d%90%87'
    expect(legacyKey(`https://uswat.edu.pk${k}/`)).toBe(legacyKey('/2026/11/%F0%9D%90%87'))
    expect(legacyKey('https://uswat.edu.pk/a/b/?x=1#y')).toBe('/a/b')
    expect(legacyKey('https://uswat.edu.pk/')).toBe('/')
    expect(legacyKey('/')).toBe('/')
  })
  it('keeps a malformed escape as written instead of throwing', () => {
    expect(legacyKey('/bad%zz/')).toBe('/bad%zz')
  })
})

describe('parseCsv', () => {
  it('reads quotes, doubled quotes, commas in fields, CRLF and a byte-order mark', () => {
    const rows = parseCsv('﻿a,b\r\n"x,1","he said ""hi"""\r\n\r\n')
    expect(rows).toEqual([['a', 'b'], ['x,1', 'he said "hi"']])
  })
})

describe('buildRules', () => {
  const row = (oldUrl: string, newUrl: string) => ({ oldUrl, newUrl, action: '' })
  it('splits rows into redirect, gone and same-address', () => {
    const b = buildRules([
      row('https://uswat.edu.pk/a/', '/b/'),
      row('https://uswat.edu.pk/c/', ''),
      row('https://uswat.edu.pk/d/', '/d/'),
    ])
    expect(b.rules.redirects).toEqual({ '/a': '/b' })
    expect(b.rules.gone).toEqual(['/c'])
    expect(b.same).toEqual(['/d'])
    expect(b.problems).toEqual([])
  })
  it('reports a repeated old address, a chain, a chain into a 410 and an off-site target', () => {
    const b = buildRules([
      row('https://uswat.edu.pk/a/', '/b/'),
      row('https://uswat.edu.pk/A/'.toLowerCase(), '/b/'),
      row('https://uswat.edu.pk/b/', '/c/'),
      row('https://uswat.edu.pk/x/', '/gone/'),
      row('https://uswat.edu.pk/gone/', ''),
      row('https://uswat.edu.pk/y/', '//evil.example/'),
    ])
    const text = b.problems.join('\n')
    expect(text).toMatch(/old address repeated/)
    expect(text).toMatch(/chain: \/a -> \/b -> \/c/)
    expect(text).toMatch(/chain: \/x -> \/gone which answers 410/)
    expect(text).toMatch(/not a path on this site/)
  })
})

describe('resolveLegacy', () => {
  const rules: LegacyRules = { redirects: { '/old': '/new' }, gone: ['/dead'] }
  it('answers a mapped address with or without a trailing slash in one step', () => {
    expect(resolveLegacy('/old/', rules)).toEqual({ kind: 'redirect', to: '/new' })
    expect(resolveLegacy('/old', rules)).toEqual({ kind: 'redirect', to: '/new' })
    expect(resolveLegacy('/dead/', rules)).toEqual({ kind: 'gone' })
  })
  it('sends other slash paths to the same path without the slash, and leaves the rest alone', () => {
    expect(resolveLegacy('/other/', rules)).toEqual({ kind: 'trailing-slash', to: '/other' })
    expect(resolveLegacy('/other', rules)).toBeNull()
    expect(resolveLegacy('/', rules)).toBeNull()
  })
  it('does not treat object property names as addresses', () => {
    expect(resolveLegacy('/constructor', rules)).toBeNull()
    expect(resolveLegacy('/__proto__', rules)).toBeNull()
  })
})

describe('the committed route map (MIG-02, offline)', () => {
  const rows = readRows(csv)
  const built = buildRules(rows)

  it('has no repeated address, no chain and no off-site target', () => {
    expect(built.problems).toEqual([])
  })
  it('accounts for every row exactly once: redirect, gone or same address', () => {
    expect(rows).toHaveLength(1613)
    expect(Object.keys(built.rules.redirects).length + built.rules.gone.length + built.same.length).toBe(rows.length)
    expect(built.rules.gone).toHaveLength(5)
  })
  it('never redirects an address the new site already serves', () => {
    const hits = Object.keys(built.rules.redirects).filter(isReserved)
    expect(hits).toEqual([])
    expect(built.rules.gone.filter(isReserved)).toEqual([])
  })
  it('only the home page and Pages keep the same address, and none of them redirects', () => {
    for (const key of built.same) expect(resolveLegacy(key, built.rules)).toBeNull()
  })
  it('every target is a path with no trailing slash, so it needs no second redirect', () => {
    for (const to of Object.values(built.rules.redirects)) {
      expect(to.startsWith('/') && !to.startsWith('//')).toBe(true)
      expect(to === canonicalTarget(to)).toBe(true)
    }
  })
  it('the generated JSON is up to date (run `pnpm routemap:build` after editing the CSV)', () => {
    expect(generated).toEqual(JSON.parse(JSON.stringify(built.rules)))
  })
})
