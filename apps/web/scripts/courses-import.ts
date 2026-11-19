/**
 * Loads courses from a JSON file (an array of { email, code, title, season, year, programme }) into the portal's own database.
 * The portal never connects to Odoo: data is migrated in from a file. Usage:
 *   pnpm identity:courses-import <file.json> [--dry-run]
 * Needs PORTAL_DATABASE_URL. A dry run counts everything and then rolls back. Rows are checked by the same rules as typed entries.
 */
import fs from 'node:fs'

import { closeIdentityPool, getIdentityPool } from '../src/modules/identity/db'
import { importCourses } from '../src/modules/portal/courses/importer'

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const file = args.find((a) => !a.startsWith('--'))
  const url = process.env.PORTAL_DATABASE_URL
  if (!file || !url) {
    console.error('Usage: PORTAL_DATABASE_URL=... pnpm identity:courses-import <file.json> [--dry-run]')
    process.exit(2)
  }
  const rows: unknown = JSON.parse(fs.readFileSync(file, 'utf8'))
  const report = await importCourses(getIdentityPool(url), rows, Date.now(), { dryRun })
  console.log(JSON.stringify(report, null, 2))
  await closeIdentityPool()
}

main().catch(async (e) => {
  console.error(e instanceof Error ? e.message : e)
  await closeIdentityPool()
  process.exit(1)
})
