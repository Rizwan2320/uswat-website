/**
 * Refusal messages are read by office staff. They must use the words on the screen (Stage,
 * Fact-check, Owner office, Take down on ...), never the code names behind them. Scans the
 * sentences in the policy and media modules; error CODES are unchanged and tests match those.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const FILES = ['policy.ts', 'mediaRules.ts', 'mediaGuard.ts', 'accessibility.ts', 'hooks.ts']
const CODE_WORDS = [
  /\bexpireAt\b/,
  /\bpublishAt\b/,
  /\bownerOffice\b/,
  /\breviewDueAt\b/,
  /\bin_review\b/,
  /\bhigh_impact\b/,
  /\bhigh-impact\b/,
  /\brisk class\b/i,
  /\bverification status\b/i,
  /\bworkflow status\b/i,
  /\bsha-?256\b/i,
  /Save draft/,
]

const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1')

function sentences(src: string): string[] {
  const out: string[] = []
  const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g
  for (const m of stripComments(src).matchAll(re)) {
    const s = m[1] ?? m[2] ?? m[3] ?? ''
    if (s.length > 25 && s.includes(' ')) out.push(s)
  }
  return out
}

describe('refusal messages use editor wording', () => {
  for (const f of FILES) {
    it(`${f}: no code names in sentences`, () => {
      const src = readFileSync(path.join(__dirname, '../../src/governance', f), 'utf8')
      const hits = sentences(src).filter((s) => CODE_WORDS.some((w) => w.test(s)))
      expect(hits).toEqual([])
    })
  }
})
