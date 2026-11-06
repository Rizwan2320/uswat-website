import { describe, expect, it } from 'vitest'

import { parseEnv } from '@/env'

const valid = {
  DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/uswat',
  PAYLOAD_SECRET: 'a'.repeat(16),
  CRON_SECRET: 'b'.repeat(16),
  PREVIEW_SECRET: 'c'.repeat(16),
}

describe('parseEnv', () => {
  it('accepts a complete environment and defaults the server URL', () => {
    const env = parseEnv(valid)
    expect(env.NEXT_PUBLIC_SERVER_URL).toBe('http://localhost:3000')
  })

  it('rejects a missing DATABASE_URL', () => {
    const { DATABASE_URL: _omit, ...rest } = valid
    expect(() => parseEnv(rest)).toThrow(/DATABASE_URL/)
  })

  it('rejects secrets shorter than 16 characters', () => {
    expect(() => parseEnv({ ...valid, CRON_SECRET: 'short' })).toThrow(/CRON_SECRET/)
  })
})
