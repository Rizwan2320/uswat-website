/**
 * Recovery codes (Addendum C AUTH-05): ten single-use codes, stored hashed, and
 * regenerating invalidates the old set.
 *
 * Why our own and not the library's: the library keeps backup codes encrypted (reversible,
 * spike S-2 finding F). A code here is 50 random bits, so a salted SHA-256 is enough
 * (NIST SP 800-63B-4 treats such lookup secrets as high-entropy random values) and nothing
 * can be decrypted from the table. No custom cryptography: random bytes and a standard hash.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export const RECOVERY_CODE_COUNT = 10
// 32 characters (no I or O, no 0 or 1): 5 bits each, and 32 divides 256 so the byte mask is unbiased.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 10

export type RecoveryRecord = { salt: string; hash: string; usedAt: number | null }

function hashCode(salt: string, normalised: string): string {
  return createHash('sha256').update(`${salt}:${normalised}`).digest('hex')
}

export function normaliseRecoveryCode(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase()
}

export function generateRecoveryCodes(): { codes: string[]; records: RecoveryRecord[] } {
  const codes: string[] = []
  const records: RecoveryRecord[] = []
  const seen = new Set<string>()
  while (codes.length < RECOVERY_CODE_COUNT) {
    const bytes = randomBytes(CODE_LENGTH)
    let raw = ''
    for (const b of bytes) raw += ALPHABET[b & 31]
    if (seen.has(raw)) continue
    seen.add(raw)
    const salt = randomBytes(16).toString('hex')
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5)}`)
    records.push({ salt, hash: hashCode(salt, raw), usedAt: null })
  }
  return { codes, records }
}

export type ConsumeResult =
  | { ok: true; records: RecoveryRecord[]; remaining: number }
  | { ok: false }

/** Returns new records on success and never mutates the input. Checks every record, so timing does not show which one matched. */
export function verifyAndConsume(records: RecoveryRecord[], input: string, now: number): ConsumeResult {
  const code = normaliseRecoveryCode(input)
  if (code.length !== CODE_LENGTH) return { ok: false }
  let matched = -1
  records.forEach((r, i) => {
    const a = Buffer.from(hashCode(r.salt, code), 'hex')
    const b = Buffer.from(r.hash, 'hex')
    if (a.length === b.length && timingSafeEqual(a, b) && r.usedAt === null && matched === -1) matched = i
  })
  if (matched === -1) return { ok: false }
  const next = records.map((r, i) => (i === matched ? { ...r, usedAt: now } : r))
  return { ok: true, records: next, remaining: next.filter((r) => r.usedAt === null).length }
}
