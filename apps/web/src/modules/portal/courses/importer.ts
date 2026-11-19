/**
 * Course import (FP-30). The portal never connects to Odoo or any other system: data is migrated in from an uploaded file.
 * Each row names a faculty account by email and carries the same fields as a typed course, and passes the same rules
 * (`validateCourse`). A bad row is rejected and reported, never loaded. All accepted rows are written in ONE transaction, so a
 * database failure leaves nothing half-loaded, and `dryRun` rolls everything back after counting. Imported rows have source
 * `import`, so the person cannot remove them by hand. Accounts must already exist (matched by email, case-insensitive).
 */
import type pg from 'pg'

import { insertCourseTx } from './pgStore'
import { validateCourse, type CourseErrors } from './rules'

export type ImportReason = 'invalid' | 'unknown-key' | 'unknown-account' | 'bad-row'
export type RejectedRow = { row: number; reason: ImportReason; errors?: CourseErrors }
export type ImportReport = { added: number; duplicate: number; limit: number; rejected: RejectedRow[]; dryRun: boolean }

export const MAX_ROWS = 5000

export async function importCourses(pool: pg.Pool, rows: unknown, now: number, opts: { dryRun?: boolean } = {}): Promise<ImportReport> {
  if (!Array.isArray(rows)) throw new Error('rows must be an array')
  if (rows.length > MAX_ROWS) throw new Error(`too many rows (limit ${MAX_ROWS})`)
  const report: ImportReport = { added: 0, duplicate: 0, limit: 0, rejected: [], dryRun: !!opts.dryRun }
  const client = await pool.connect()
  try {
    await client.query('begin')
    const accountIds = new Map<string, string | null>()
    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i]
      const row = i + 1
      if (typeof raw !== 'object' || raw === null || Array.isArray(raw) || typeof (raw as Record<string, unknown>).email !== 'string') {
        report.rejected.push({ row, reason: 'bad-row' })
        continue
      }
      const { email, ...fields } = raw as Record<string, unknown> & { email: string }
      const v = validateCourse(fields, now)
      if (!v.ok) {
        report.rejected.push({ row, reason: v.errors.form === 'unknown' ? 'unknown-key' : 'invalid', errors: v.errors })
        continue
      }
      const key = email.trim().toLowerCase()
      if (!accountIds.has(key)) {
        const { rows: found } = await client.query<{ id: string }>(`select "id" from "user" where lower("email") = $1`, [key])
        accountIds.set(key, found[0]?.id ?? null)
      }
      const accountId = accountIds.get(key)
      if (!accountId) {
        report.rejected.push({ row, reason: 'unknown-account' })
        continue
      }
      const outcome = await insertCourseTx(client, accountId, v.course, 'import')
      if (outcome === 'added') report.added++
      else if (outcome === 'duplicate') report.duplicate++
      else report.limit++
    }
    await client.query(opts.dryRun ? 'rollback' : 'commit')
  } catch (e) {
    await client.query('rollback')
    throw e
  } finally {
    client.release()
  }
  return report
}
