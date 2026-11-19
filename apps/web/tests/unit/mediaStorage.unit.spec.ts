import type { Config } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { mediaStorage, mediaStoragePlugin } from '../../src/plugins/mediaStorage'

const TOKEN = 'vercel_blob_rw_abc123_secretsecret'

describe('mediaStorage (which place holds uploads)', () => {
  it('uses Blob when a token is set', () => {
    expect(mediaStorage({ BLOB_READ_WRITE_TOKEN: TOKEN })).toEqual({ mode: 'blob', warning: null })
  })
  it('uses the local folder with no token, quietly when not on Vercel', () => {
    expect(mediaStorage({})).toEqual({ mode: 'local', warning: null })
    expect(mediaStorage({ BLOB_READ_WRITE_TOKEN: '   ' })).toEqual({ mode: 'local', warning: null })
  })
  it('warns when on Vercel without a token, in words an owner can act on', () => {
    for (const source of [{ VERCEL: '1' }, { VERCEL_ENV: 'preview' }]) {
      const c = mediaStorage(source)
      expect(c.mode).toBe('local')
      expect(c.warning).toMatch(/BLOB_READ_WRITE_TOKEN is not set/)
      expect(c.warning).toMatch(/read-only/)
    }
  })
  it('does not warn on Vercel when the token is there', () => {
    expect(mediaStorage({ VERCEL: '1', BLOB_READ_WRITE_TOKEN: TOKEN }).warning).toBeNull()
  })
})

const base = (): Config =>
  ({
    secret: 'x',
    collections: [{ slug: 'media', fields: [], upload: { staticDir: '/tmp/x' } }],
  }) as unknown as Config

const upload = (c: Config) =>
  (c.collections?.find((x) => x.slug === 'media')?.upload ?? {}) as Record<string, unknown>

describe('mediaStoragePlugin', () => {
  it('with no token, keeps the local folder and changes nothing but the stored-field list', async () => {
    const out = await mediaStoragePlugin({})(base())
    expect(upload(out).disableLocalStorage).toBeUndefined()
    expect(upload(out).staticDir).toBe('/tmp/x')
  })
  it('with a token, stops the local disk being used for media (P3med-c)', async () => {
    const out = await mediaStoragePlugin({ BLOB_READ_WRITE_TOKEN: TOKEN })(base())
    expect(upload(out).disableLocalStorage).toBe(true)
    expect(typeof (upload(out).handlers as unknown[] | undefined)?.[0]).toBe('function')
  })
  it('gives media the same stored fields with and without a token, so migrations match (P3med-a, P3med-e)', async () => {
    const names = async (source: Record<string, string | undefined>) =>
      ((await mediaStoragePlugin(source)(base())).collections?.find((x) => x.slug === 'media')?.fields ?? [])
        .map((f) => ('name' in f ? f.name : ''))
        .filter(Boolean)
        .sort()
    const without = await names({})
    expect(without).toContain('prefix')
    expect(without).toContain('_objectKey')
    expect(await names({ BLOB_READ_WRITE_TOKEN: TOKEN })).toEqual(without)
  })
  it('prints the warning at boot on Vercel without a token, and nothing otherwise', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mediaStoragePlugin({})
    expect(warn).not.toHaveBeenCalled()
    mediaStoragePlugin({ VERCEL: '1' })
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })
  it('refuses a token that is not in the Vercel format at boot, instead of failing at the first upload', () => {
    const plugin = mediaStoragePlugin({ BLOB_READ_WRITE_TOKEN: 'not-a-token' })
    expect(() => plugin(base())).toThrow(/Invalid token format/)
  })
})
