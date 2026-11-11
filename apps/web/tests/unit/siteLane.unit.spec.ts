import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Server code with no user is the trusted system and bypasses the role rules, so the public site
 * may read content through the getters but must never write (ADR-0010, amendment 2026-11-10).
 */
const ROOTS = ['src/site', 'src/app/(site)']
const WRITE =
  /\b(?:payload|req\.payload)\s*\.\s*(?:create|update|delete|updateGlobal|duplicate|restoreVersion)\s*\(|\bpayload\s*\.\s*db\b/

function files(dir: string): string[] {
  let out: string[] = []
  let entries: string[] = []
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out = out.concat(files(full))
    else if (/\.(ts|tsx)$/.test(name)) out.push(full)
  }
  return out
}

describe('site lane is read-only', () => {
  it('has no Payload write calls in src/site or src/app/(site)', () => {
    const all = ROOTS.flatMap(files)
    expect(all.length).toBeGreaterThan(0)
    const offenders = all.filter((f) => WRITE.test(readFileSync(f, 'utf8')))
    expect(offenders).toEqual([])
  })

  it('the check itself recognises a write', () => {
    expect(WRITE.test('await payload.update({ collection: "pages" })')).toBe(true)
    expect(WRITE.test('const x = await payload.find({})')).toBe(false)
  })
})
