import { sha256, stableStringify } from './hash'

/**
 * Turn "document before" and "document after" into a compact, safe change set for the
 * audit log (CMS-05: user, time and diff).
 *
 * - Objects are walked to dot paths (up to MAX_DEPTH), arrays and scalars are leaves.
 * - Values over MAX_INLINE characters (of their JSON text) are stored as a hash plus that length, so the log never
 *   duplicates a whole rich-text body and still proves that it changed.
 * - Password, token, salt, secret and session values are never stored.
 */

const IGNORED_TOP_LEVEL = new Set(['id', 'createdAt', 'updatedAt'])
const SENSITIVE_KEY = /(password|salt|token|secret|sessions|apikey)|^hash$/i
export const MAX_INLINE = 1000
export const MAX_PATHS = 200
const MAX_DEPTH = 4

export type Change = { from: unknown; to: unknown } | { redacted: true }
export type ChangeSet = Record<string, Change>

type Json = Record<string, unknown>

const isPlainObject = (v: unknown): v is Json =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date)

function flatten(value: unknown, prefix: string, depth: number, out: Map<string, unknown>): void {
  if (isPlainObject(value) && depth < MAX_DEPTH && Object.keys(value).length > 0) {
    for (const [key, child] of Object.entries(value)) {
      if (depth === 0 && IGNORED_TOP_LEVEL.has(key)) continue
      flatten(child, prefix ? `${prefix}.${key}` : key, depth + 1, out)
    }
    return
  }
  out.set(prefix, value)
}

function shrink(value: unknown): unknown {
  if (value === undefined) return null
  const text = stableStringify(value)
  return text.length <= MAX_INLINE ? value : { _hash: sha256(text), _chars: text.length }
}

export function buildChanges(
  previous: Record<string, unknown> | null | undefined,
  next: Record<string, unknown> | null | undefined,
): ChangeSet {
  const before = new Map<string, unknown>()
  const after = new Map<string, unknown>()
  if (previous) flatten(previous, '', 0, before)
  if (next) flatten(next, '', 0, after)

  const paths = [...new Set([...before.keys(), ...after.keys()])].filter(Boolean).sort()
  const changes: ChangeSet = {}
  let count = 0
  for (const path of paths) {
    const from = before.get(path)
    const to = after.get(path)
    if (stableStringify(from) === stableStringify(to)) continue
    if (count >= MAX_PATHS) {
      changes._truncated = { from: null, to: `${paths.length - MAX_PATHS} more changed fields not listed` }
      break
    }
    const leaf = path.split('.').at(-1) ?? path
    changes[path] = SENSITIVE_KEY.test(leaf) ? { redacted: true } : { from: shrink(from), to: shrink(to) }
    count += 1
  }
  return changes
}
