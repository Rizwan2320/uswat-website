/**
 * Generates src/legacy/routeMap.generated.json from scripts/import/data/route_map.csv.
 * Usage (from apps/web): pnpm routemap:build
 * The unit test fails if the committed JSON differs from what this would write.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { buildRules, readRows } from '../src/legacy/routeMap'

const csvPath = path.resolve(process.cwd(), '../../scripts/import/data/route_map.csv')
const outPath = path.resolve(process.cwd(), 'src/legacy/routeMap.generated.json')

const { rules, same, problems } = buildRules(readRows(readFileSync(csvPath, 'utf8')))
if (problems.length) {
  console.error(`route map has ${problems.length} problem(s):\n${problems.slice(0, 20).join('\n')}`)
  process.exit(1)
}
writeFileSync(outPath, JSON.stringify(rules, null, 1) + '\n')
console.log(
  `wrote ${Object.keys(rules.redirects).length} redirects and ${rules.gone.length} gone; ${same.length} rows keep the same address`,
)
