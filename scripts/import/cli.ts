import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { PACK_FILES, normaliseRecord, recordsOf, type SourceRecord } from './contract'
import { planImport, readRouteRows, type Existing } from './plan'
import { buildReport, reportMarkdown } from './report'
import { applyDecisions, articleSlugs, assertLocalDatabase, loadExisting, type Cms } from './writer'

export type CliOptions = { apply: boolean; withDb: boolean; packDir?: string; routeMap: string; reportDir: string }

export function parseArgs(argv: string[], env: Record<string, string | undefined>, defaults: { routeMap: string; reportDir: string }): CliOptions {
  const flag = (n: string) => argv.includes(n)
  const value = (n: string) => {
    const i = argv.indexOf(n)
    return i >= 0 ? argv[i + 1] : undefined
  }
  return {
    apply: flag('--apply'),
    withDb: flag('--with-db'),
    packDir: value('--pack') ?? env.SWAT_IMPORT_PACK_DIR,
    routeMap: value('--route-map') ?? defaults.routeMap,
    reportDir: value('--report-dir') ?? defaults.reportDir,
  }
}

export function readPack(dir: string): SourceRecord[] {
  const out: SourceRecord[] = []
  for (const f of PACK_FILES) {
    const p = path.join(dir, f)
    if (!existsSync(p)) continue
    for (const raw of recordsOf(JSON.parse(readFileSync(p, 'utf8')))) {
      const r = normaliseRecord(raw)
      if (r) out.push(r)
    }
  }
  return out
}

/** `getCms` opens Payload; it is only called when the run needs the database. */
export async function runImport(opts: CliOptions, env: Record<string, string | undefined>, getCms: () => Promise<Cms>) {
  if (!opts.packDir) throw new Error('No data pack: set SWAT_IMPORT_PACK_DIR or pass --pack <folder>')
  if (!existsSync(opts.packDir)) throw new Error(`Data pack folder not found: ${opts.packDir}`)
  const rows = readRouteRows(readFileSync(opts.routeMap, 'utf8'))
  const records = readPack(opts.packDir)

  let cms: Cms | undefined
  let existing = new Map<string, Existing>()
  if (opts.apply || opts.withDb) {
    assertLocalDatabase(env.DATABASE_URL)
    cms = await getCms()
    existing = await loadExisting(cms, articleSlugs())
  }
  const plan = planImport({ rows, records, existing })
  const report = buildReport(plan)
  const mode = opts.apply ? 'apply' : 'dry run'
  let applied
  if (opts.apply && cms) applied = await applyDecisions(cms, plan.decisions)

  mkdirSync(opts.reportDir, { recursive: true })
  writeFileSync(path.join(opts.reportDir, 'report.json'), JSON.stringify({ mode, applied, ...report }, null, 1) + '\n')
  const md = reportMarkdown(report, mode) + (applied ? `\nWritten: ${applied.created} created, ${applied.updated} updated.\n` : '')
  writeFileSync(path.join(opts.reportDir, 'report.md'), md)
  return { plan, report, applied, markdown: md }
}
