import { spawnSync } from 'node:child_process'
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * `scripts/vercel-build.sh` against a stand-in `pnpm` that records what it was asked to run. It proves the Sample
 * seeding call (ADR-0026) happens only for a preview build with the flag on, uses the direct database host, and never
 * fails the build.
 */
const script = path.resolve(__dirname, '../../scripts/vercel-build.sh')

function run(env: Record<string, string>) {
  const dir = mkdtempSync(path.join(tmpdir(), 'vercel-build-'))
  const log = path.join(dir, 'calls.log')
  writeFileSync(log, '')
  const shim = path.join(dir, 'pnpm')
  writeFileSync(
    shim,
    `#!/bin/sh
echo "$1|$DATABASE_URL" >> "${log}"
if [ "$1" = "seed:preview" ] && [ -n "\${FAIL_SEED:-}" ]; then exit 1; fi
exit 0
`,
  )
  chmodSync(shim, 0o755)
  const result = spawnSync('sh', [script], {
    env: { PATH: `${dir}:/usr/bin:/bin`, DATABASE_URL: 'postgres://u:p@ep-abc-pooler.region.neon.tech/db', ...env } as unknown as NodeJS.ProcessEnv,
    encoding: 'utf8',
  })
  const calls = readFileSync(log, 'utf8').trim().split('\n').filter(Boolean)
  return { status: result.status, calls, out: `${result.stdout}${result.stderr}` }
}

describe('vercel-build.sh seeding step', () => {
  it('never seeds a production build, even with the flag set', () => {
    const r = run({ VERCEL_ENV: 'production', SEED_SAMPLE_ON_PREVIEW: 'true' })
    expect(r.status).toBe(0)
    expect(r.calls.map((c) => c.split('|')[0])).toEqual(['db:migrate', 'build'])
  })

  it('does not seed a preview build when the flag is off or missing', () => {
    const cases: Record<string, string>[] = [{ VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'preview', SEED_SAMPLE_ON_PREVIEW: 'false' }]
    for (const env of cases) {
      const r = run(env)
      expect(r.status).toBe(0)
      expect(r.calls.map((c) => c.split('|')[0])).toEqual(['db:migrate', 'build'])
    }
  })

  it('does not seed outside Vercel', () => {
    const r = run({ SEED_SAMPLE_ON_PREVIEW: 'true' })
    expect(r.calls.map((c) => c.split('|')[0])).toEqual(['db:migrate', 'build'])
  })

  it('seeds a preview build with the flag on, between the migration and the build, using the direct host', () => {
    const r = run({ VERCEL_ENV: 'preview', SEED_SAMPLE_ON_PREVIEW: 'true' })
    expect(r.status).toBe(0)
    expect(r.calls.map((c) => c.split('|')[0])).toEqual(['db:migrate', 'seed:preview', 'build'])
    for (const call of r.calls.slice(0, 2)) expect(call).not.toContain('-pooler')
  })

  it('keeps building when the seed fails', () => {
    const r = run({ VERCEL_ENV: 'preview', SEED_SAMPLE_ON_PREVIEW: 'true', FAIL_SEED: '1' })
    expect(r.status).toBe(0)
    expect(r.calls.map((c) => c.split('|')[0])).toEqual(['db:migrate', 'seed:preview', 'build'])
    expect(r.out).toContain('continuing the build without Sample data')
  })
})
