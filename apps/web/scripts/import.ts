/**
 * Importer entry (MIG-01, ADR 0009). Dry run by default.
 *   SWAT_IMPORT_PACK_DIR=/path/to/pack pnpm import:run                 dry run, no database
 *   ... pnpm import:run --with-db                                      dry run compared with the local database
 *   ... pnpm import:run --apply                                        write drafts (local database only)
 */
import path from 'node:path'

import { parseArgs, runImport } from '../../../scripts/import/cli'
import type { Cms } from '../../../scripts/import/writer'

const root = path.resolve(process.cwd(), '../..')
const opts = parseArgs(process.argv.slice(2), process.env, {
  routeMap: path.join(root, 'scripts/import/data/route_map.csv'),
  reportDir: path.join(root, 'scripts/import/out'),
})

runImport(opts, process.env, async () => {
  const { getPayload } = await import('payload')
  const config = await (await import('../src/payload.config')).default
  return (await getPayload({ config })) as unknown as Cms
})
  .then(({ markdown }) => {
    console.log(markdown)
    process.exit(0)
  })
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  })
