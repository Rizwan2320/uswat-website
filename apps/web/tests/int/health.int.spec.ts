import { describe, expect, it } from 'vitest'

import { GET as healthz } from '@/app/(frontend)/healthz/route'
import { GET as readyz } from '@/app/(frontend)/readyz/route'

describe('health endpoints', () => {
  it('healthz answers without touching the database', async () => {
    const res = await healthz()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('readyz reports the database as ok when Postgres is reachable', async () => {
    const res = await readyz()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ready', database: 'ok' })
  })
})
