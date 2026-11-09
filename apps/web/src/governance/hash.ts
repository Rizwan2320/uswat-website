import { createHash } from 'node:crypto'

/**
 * Stable JSON: object keys sorted, undefined dropped, so the same content always
 * produces the same text and therefore the same hash.
 */
export function stableStringify(value: unknown): string {
  if (value === undefined) return 'null'
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (value instanceof Date) return JSON.stringify(value.toISOString())
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`
}

export const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex')

/** Hash of the named content fields of a document (missing fields count as null). */
export function hashContent(
  doc: Record<string, unknown> | null | undefined,
  fields: readonly string[],
): string {
  const picked: Record<string, unknown> = {}
  for (const f of fields) picked[f] = doc?.[f] ?? null
  return sha256(stableStringify(picked))
}
