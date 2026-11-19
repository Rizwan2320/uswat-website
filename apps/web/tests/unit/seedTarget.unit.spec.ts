import { describe, expect, it } from 'vitest'

import { assertSeedTarget } from '../../../../scripts/import/writer'

const LOCAL = 'postgres://u:p@127.0.0.1:5433/uswat'
const PREVIEW_HOST = 'ep-preview-123.us-east-2.aws.neon.tech'
const PREVIEW = `postgres://u:p@${PREVIEW_HOST}/neondb?sslmode=require`
const PROD = 'postgres://u:p@ep-prod-999.us-east-2.aws.neon.tech/neondb?sslmode=require'
const ALL_THREE = { VERCEL_ENV: 'preview', SEED_SAMPLE_ON_PREVIEW: 'true', SEED_ALLOWED_DB_HOST: PREVIEW_HOST }

describe('assertSeedTarget (ADR-0026)', () => {
  it('allows a database on this machine with no variables set', () => {
    expect(assertSeedTarget(LOCAL, {})).toBe('local')
    expect(assertSeedTarget('postgres://u:p@localhost:5432/x', {})).toBe('local')
  })
  it('allows a hosted database only with all three locks right', () => {
    expect(assertSeedTarget(PREVIEW, ALL_THREE)).toBe('preview')
    expect(assertSeedTarget(PREVIEW, { ...ALL_THREE, SEED_ALLOWED_DB_HOST: PREVIEW_HOST.toUpperCase() })).toBe('preview')
  })
  it('refuses a hosted database when any one lock is missing or wrong', () => {
    expect(() => assertSeedTarget(PREVIEW, {})).toThrow(/VERCEL_ENV/)
    expect(() => assertSeedTarget(PREVIEW, { ...ALL_THREE, VERCEL_ENV: 'development' })).toThrow(/VERCEL_ENV/)
    expect(() => assertSeedTarget(PREVIEW, { ...ALL_THREE, SEED_SAMPLE_ON_PREVIEW: undefined })).toThrow(/SEED_SAMPLE_ON_PREVIEW/)
    for (const v of ['false', 'TRUE', '1', 'yes', '']) expect(() => assertSeedTarget(PREVIEW, { ...ALL_THREE, SEED_SAMPLE_ON_PREVIEW: v })).toThrow(/SEED_SAMPLE_ON_PREVIEW/)
    expect(() => assertSeedTarget(PREVIEW, { ...ALL_THREE, SEED_ALLOWED_DB_HOST: undefined })).toThrow(/SEED_ALLOWED_DB_HOST/)
    expect(() => assertSeedTarget(PREVIEW, { ...ALL_THREE, SEED_ALLOWED_DB_HOST: '  ' })).toThrow(/SEED_ALLOWED_DB_HOST/)
    expect(() => assertSeedTarget(PREVIEW, { ...ALL_THREE, SEED_ALLOWED_DB_HOST: 'ep-other.neon.tech' })).toThrow(/not the allowed preview host/)
  })
  it('refuses a production host even with the preview flag wrongly set', () => {
    expect(() => assertSeedTarget(PROD, ALL_THREE)).toThrow(/not the allowed preview host/)
    expect(() => assertSeedTarget(PROD, { ...ALL_THREE, VERCEL_ENV: 'production' })).toThrow(/production build/)
  })
  it('refuses every production build, even when the host matches or the address is local', () => {
    const prod = { ...ALL_THREE, VERCEL_ENV: 'production' }
    expect(() => assertSeedTarget(PREVIEW, prod)).toThrow(/production build/)
    expect(() => assertSeedTarget(LOCAL, prod)).toThrow(/production build/)
    expect(() => assertSeedTarget(PROD, { ...prod, SEED_ALLOWED_DB_HOST: 'ep-prod-999.us-east-2.aws.neon.tech' })).toThrow(/production build/)
  })
  it('refuses a missing or invalid address', () => {
    expect(() => assertSeedTarget(undefined, ALL_THREE)).toThrow(/DATABASE_URL is not set/)
    expect(() => assertSeedTarget('', ALL_THREE)).toThrow(/DATABASE_URL is not set/)
    expect(() => assertSeedTarget('not a url', ALL_THREE)).toThrow()
  })
  it('does not let a hosted name hide behind localhost in the user part', () => {
    expect(() => assertSeedTarget('postgres://localhost@ep-prod-999.neon.tech/x', {})).toThrow()
  })
})
