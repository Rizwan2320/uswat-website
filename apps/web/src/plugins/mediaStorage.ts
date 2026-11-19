/**
 * Where uploaded media is kept (slice 3t, ADR-0014).
 *
 * With `BLOB_READ_WRITE_TOKEN` set, files go to Vercel Blob through Payload's storage adapter.
 * Without it they go to the local folder in Media.ts, so development and CI do not change.
 * Vercel's deployed disk is read-only, so a Vercel deployment without the token cannot keep
 * uploads; `mediaStorage` says so in words and the config prints it at boot (it does not stop a
 * build, because a build has no reason to upload).
 *
 * File addresses stay `/api/media/file/<name>` (the adapter's default), so Payload still serves
 * and guards the files and the site's image settings do not change.
 */
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import type { Plugin } from 'payload'

export interface MediaStorageChoice {
  mode: 'blob' | 'local'
  /** Set when the choice will not work where the site is running. */
  warning: string | null
}

type Source = Record<string, string | undefined>

/** Pure: decides the mode and the warning from the environment. */
export function mediaStorage(source: Source): MediaStorageChoice {
  const token = source.BLOB_READ_WRITE_TOKEN?.trim()
  if (token) return { mode: 'blob', warning: null }
  const onVercel = Boolean(source.VERCEL) || Boolean(source.VERCEL_ENV)
  return {
    mode: 'local',
    warning: onVercel
      ? 'BLOB_READ_WRITE_TOKEN is not set on this Vercel deployment. Vercel\'s disk is read-only, so image uploads will fail or be lost. Create a Blob store and set the token (docs/adr/0014-media-storage-vercel-blob.md).'
      : null,
  }
}

/** The plugin for this environment: the Blob adapter when a token is set, nothing otherwise. */
export function mediaStoragePlugin(source: Source = process.env): Plugin {
  const choice = mediaStorage(source)
  if (choice.warning) console.warn(`[media storage] ${choice.warning}`)
  return vercelBlobStorage({
    enabled: choice.mode === 'blob',
    token: source.BLOB_READ_WRITE_TOKEN?.trim(),
    collections: { media: true },
    // The adapter adds `prefix` and `_objectKey` columns to media only when it is switched on. With
    // this, the columns exist in every environment, so migrations made without a token still match
    // a deployment that has one (found in P3med-a: without it the schema differed by token).
    alwaysInsertFields: true,
  })
}
