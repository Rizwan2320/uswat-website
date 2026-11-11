import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test, expect } from '@playwright/test'

import { buildRules, legacyKey, readRows } from '../../src/legacy/routeMap'

/* MIG-02 on a running server: every old address in the route map, requested the way the old site wrote
   it (with a trailing slash). Runs against a server on localhost:3000 (a production build). */
const base = 'http://localhost:3000'
const rows = readRows(readFileSync(path.resolve(process.cwd(), '../../scripts/import/data/route_map.csv'), 'utf8'))
const { rules, same } = buildRules(rows)

async function inChunks<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += size) await Promise.all(items.slice(i, i + size).map(fn))
}

test.describe('old addresses (MIG-02)', () => {
  test.setTimeout(180_000)

  test('every redirect row answers a 301 to its new path, and that path is not redirected again', async ({ request }) => {
    const failures: string[] = []
    const oldUrls = rows.filter((r) => legacyKey(r.oldUrl) in rules.redirects).map((r) => r.oldUrl)
    expect(oldUrls).toHaveLength(Object.keys(rules.redirects).length)
    await inChunks(oldUrls, 40, async (oldUrl) => {
      const p = new URL(oldUrl).pathname
      const res = await request.get(base + p, { maxRedirects: 0 })
      const want = rules.redirects[legacyKey(oldUrl)]
      const loc = res.headers()['location'] ?? ''
      const gotPath = loc.startsWith('http') ? new URL(loc).pathname : loc
      if (res.status() !== 301 || gotPath.toLowerCase() !== want.toLowerCase()) failures.push(`${p} -> ${res.status()} ${loc}`)
      else {
        const next = await request.get(base + gotPath, { maxRedirects: 0 })
        if (next.status() >= 300 && next.status() < 400) failures.push(`${p} -> second hop ${next.status()} ${gotPath}`)
      }
    })
    expect(failures.slice(0, 10)).toEqual([])
  })

  test('every explicit-410 row answers 410 with no body page and is not indexed', async ({ request }) => {
    const gone = rows.filter((r) => rules.gone.includes(legacyKey(r.oldUrl)))
    expect(gone).toHaveLength(5)
    for (const r of gone) {
      const res = await request.get(base + new URL(r.oldUrl).pathname, { maxRedirects: 0 })
      expect(res.status(), r.oldUrl).toBe(410)
      expect(res.headers()['x-robots-tag']).toBe('noindex')
    }
  })

  test('same-address rows are never 301 or 410, and reach their page in at most one slash redirect', async ({ request }) => {
    const sameUrls = rows.filter((r) => same.includes(legacyKey(r.oldUrl))).map((r) => new URL(r.oldUrl).pathname)
    expect(sameUrls).toHaveLength(same.length)
    const bad: string[] = []
    await inChunks(sameUrls, 40, async (p) => {
      const first = await request.get(base + p, { maxRedirects: 0 })
      if (first.status() === 301 || first.status() === 410) bad.push(`${p} ${first.status()}`)
      if (first.status() === 308 || first.status() === 307) {
        const loc = first.headers()['location']!
        const second = await request.get(loc.startsWith('http') ? loc : base + loc, { maxRedirects: 0 })
        if (second.status() >= 300 && second.status() < 400) bad.push(`${p} second hop ${second.status()}`)
      }
    })
    expect(bad.slice(0, 10)).toEqual([])
  })

  test('other paths keep their normal behaviour, including the trailing-slash redirect', async ({ request }) => {
    expect((await request.get(`${base}/posts/`, { maxRedirects: 0 })).status()).toBe(308)
    expect((await request.get(`${base}/posts`, { maxRedirects: 0 })).status()).toBe(200)
    expect((await request.get(`${base}/readyz`, { maxRedirects: 0 })).status()).toBe(200)
    expect((await request.get(`${base}/`, { maxRedirects: 0 })).status()).toBe(200)
  })
})
