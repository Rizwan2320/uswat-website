import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(__dirname, '../../../src')
const walk = (d: string): string[] => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]))
const files = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f))
const rel = (f: string) => relative(SRC, f).replaceAll('\\', '/')

describe('what a delegate can reach (static guard)', () => {
  it('only the profile, publications and courses actions may act for someone else', () => {
    const users = files.filter((f) => /accountFor|resolveAccount/.test(readFileSync(f, 'utf8')) && !/modules\/portal\/delegation\//.test(rel(f))).map(rel).sort()
    expect(users).toEqual(['modules/portal/courses/actions.ts', 'modules/portal/profile/actions.ts', 'modules/portal/publications/actions.ts'])
  })
  it('submit and withdraw never take a forId and stay on the signed-in account', () => {
    const src = readFileSync(join(SRC, 'modules/portal/profile/actions.ts'), 'utf8')
    for (const name of ['submitProfile', 'withdrawProfile']) {
      const m = src.match(new RegExp(`export async function ${name}\\(([^)]*)\\)`))
      expect(m, name).not.toBeNull()
      expect(m![1]).toBe('')
    }
    expect(src).toMatch(/strongAccount\(PATH\)/)
  })
  it('the delegation actions take no forId, so a delegate cannot grant, revoke or read anyone’s delegation', () => {
    const src = readFileSync(join(SRC, 'modules/portal/delegation/actions.ts'), 'utf8')
    expect(src.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/forId/)
  })
  it('security, cv, review and activation code never mention delegation', () => {
    const bad = files.filter((f) => /modules\/(identity|portal\/(cv|review|activation))\//.test(rel(f)) && /delegation\/(wiring|resolve)|accountFor/.test(readFileSync(f, 'utf8'))).map(rel)
    expect(bad).toEqual([])
  })
})
