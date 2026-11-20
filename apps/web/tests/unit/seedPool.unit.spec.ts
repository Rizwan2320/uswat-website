import { describe, expect, it } from 'vitest'

import { DEFAULT_BUDGET_MS, DEFAULT_CONCURRENCY, MAX_CONCURRENCY, runFromEnv, runPool, withoutDeadline, type Run } from '../../../../scripts/import/seeds/pool'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe('runPool', () => {
  it('runs every item once and never more than the limit at the same time', async () => {
    let inFlight = 0
    let peak = 0
    const seen: number[] = []
    await runPool([...Array(20).keys()], { concurrency: 4 }, async (n) => {
      inFlight++
      peak = Math.max(peak, inFlight)
      await sleep(3)
      seen.push(n)
      inFlight--
    })
    expect(seen.sort((a, b) => a - b)).toEqual([...Array(20).keys()])
    expect(peak).toBe(4)
  })

  it('with a limit of 1 keeps the order of the list', async () => {
    const order: number[] = []
    await runPool([1, 2, 3, 4], { concurrency: 1 }, async (n) => {
      await sleep(n % 2 ? 4 : 1)
      order.push(n)
    })
    expect(order).toEqual([1, 2, 3, 4])
  })

  it('handles an empty list and a limit larger than the list', async () => {
    await runPool([], { concurrency: 5 }, async () => {
      throw new Error('never')
    })
    const seen: number[] = []
    await runPool([1, 2], { concurrency: 8 }, async (n) => void seen.push(n))
    expect(seen.sort()).toEqual([1, 2])
  })

  it('stops starting items after a failure, lets running ones finish, and throws the first error', async () => {
    const started: number[] = []
    const finished: number[] = []
    await expect(
      runPool([1, 2, 3, 4, 5, 6, 7, 8], { concurrency: 2 }, async (n) => {
        started.push(n)
        await sleep(5)
        if (n === 2) throw new Error('boom 2')
        finished.push(n)
      }),
    ).rejects.toThrow('boom 2')
    expect(started.length).toBeLessThan(8)
    expect(finished).toContain(1)
  })

  it('stops at the deadline, marks the run stopped, and starts nothing more', async () => {
    const run: Run = { concurrency: 1, deadline: Date.now() + 25 }
    const done: number[] = []
    await runPool([...Array(50).keys()], run, async (n) => {
      await sleep(10)
      done.push(n)
    })
    expect(run.stopped).toBe(true)
    expect(done.length).toBeGreaterThan(0)
    expect(done.length).toBeLessThan(50)
  })

  it('does not mark a run stopped when everything finished before the deadline', async () => {
    const run: Run = { concurrency: 3, deadline: Date.now() + 10_000 }
    await runPool([1, 2, 3], run, async () => {})
    expect(run.stopped).toBeUndefined()
  })
})

describe('runFromEnv', () => {
  const now = 1_000_000
  it('uses the defaults', () => {
    expect(runFromEnv({}, now)).toEqual({ concurrency: DEFAULT_CONCURRENCY, deadline: now + DEFAULT_BUDGET_MS })
  })
  it('clamps the concurrency to 1..8 and ignores junk', () => {
    expect(runFromEnv({ SEED_CONCURRENCY: '100' }, now).concurrency).toBe(MAX_CONCURRENCY)
    expect(runFromEnv({ SEED_CONCURRENCY: '0' }, now).concurrency).toBe(1)
    expect(runFromEnv({ SEED_CONCURRENCY: 'abc' }, now).concurrency).toBe(DEFAULT_CONCURRENCY)
  })
  it('reads the budget; 0 means no limit; junk falls back to the default', () => {
    expect(runFromEnv({ SEED_TIME_BUDGET_MS: '5000' }, now).deadline).toBe(now + 5000)
    expect(runFromEnv({ SEED_TIME_BUDGET_MS: '0' }, now)).toEqual({ concurrency: DEFAULT_CONCURRENCY })
    expect(runFromEnv({ SEED_TIME_BUDGET_MS: '-3' }, now).deadline).toBe(now + DEFAULT_BUDGET_MS)
  })
  it('withoutDeadline keeps only the concurrency', () => {
    expect(withoutDeadline({ concurrency: 5, deadline: 9, stopped: true })).toEqual({ concurrency: 5 })
  })
})
