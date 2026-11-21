/** The digest rules, pure. */
import { DIGEST_KINDS, PERIOD_MS, isCadence, type Cadence, type DigestKind } from './kinds'

export type Line = { kind: DigestKind; count: number; firstAt: number; lastAt: number }
export type WaitingItem = { kind: DigestKind; n: number; at: number }

/** Is a digest due? Only for a person who has not turned digests off, has something waiting, and whose last digest is a full period ago. */
export function isDue(cadence: Cadence, lastDigestAt: number | null, waiting: number, now: number): boolean {
  if (!isCadence(cadence) || cadence === 'off' || waiting < 1) return false
  return lastDigestAt === null || now - lastDigestAt >= PERIOD_MS[cadence]
}

/** One line per kind, in the fixed kind order: how many, and when the first and last happened. */
export function buildLines(items: readonly WaitingItem[]): Line[] {
  const by = new Map<DigestKind, Line>()
  for (const i of items) {
    const l = by.get(i.kind)
    if (!l) by.set(i.kind, { kind: i.kind, count: i.n, firstAt: i.at, lastAt: i.at })
    else {
      l.count += i.n
      l.firstAt = Math.min(l.firstAt, i.at)
      l.lastAt = Math.max(l.lastAt, i.at)
    }
  }
  return DIGEST_KINDS.filter((k) => by.has(k)).map((k) => by.get(k)!)
}
