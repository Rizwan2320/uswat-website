import { describe, expect, it } from 'vitest'

import { SWEEP_HISTORY_DAYS } from '../../src/governance/schedule'
import { historyCutoff } from '../../src/governance/sweepHistory'

const NOW = Date.parse('2027-03-31T10:00:00.000Z')

describe('historyCutoff', () => {
  it('is the retention period before now', () => {
    expect(historyCutoff(NOW, 30)).toBe('2027-03-01T10:00:00.000Z')
  })
  it('uses the shared retention constant by default', () => {
    expect(historyCutoff(NOW)).toBe(historyCutoff(NOW, SWEEP_HISTORY_DAYS))
  })
  it('never keeps less than a day, so a bad setting cannot empty the history', () => {
    expect(historyCutoff(NOW, 0)).toBe('2027-03-30T10:00:00.000Z')
    expect(historyCutoff(NOW, -5)).toBe('2027-03-30T10:00:00.000Z')
  })
})
