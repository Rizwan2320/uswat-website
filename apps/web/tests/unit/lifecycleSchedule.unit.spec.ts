import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { LIFECYCLE_CRON } from '@/governance/schedule'

/**
 * The cadence is one setting (main agent, PR #3): the task schedule and the GitHub Actions cron
 * must be the same expression, and the default must be no more frequent than hourly.
 */
describe('lifecycle cadence', () => {
  const workflow = readFileSync(
    resolve(process.cwd(), '../../.github/workflows/lifecycle-sweep.yml'),
    'utf8',
  )

  it('the workflow cron equals LIFECYCLE_CRON', () => {
    const m = workflow.match(/^\s*-\s*cron:\s*'([^']+)'/m)
    expect(m?.[1]).toBe(LIFECYCLE_CRON)
  })

  it('is hourly by default: a fixed minute, every hour', () => {
    expect(LIFECYCLE_CRON).toMatch(/^\d{1,2} \* \* \* \*$/)
  })
})
