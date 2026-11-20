# P3 slice 3t (media storage): images must survive a deploy

**Branch:** `p3/media-storage-3t`, from `main`. Source: `docs/briefs/p3t-admin-theme-and-media.md` (main agent). **Lane:** `src/collections/Media.ts`, `src/plugins`, `payload.config.ts`, `src/env.ts`, `docs/adr`, tests.

(Naming note: this is the main agent's slice 3t. My earlier Operations panel, PR #86, used "3t" by mistake; it is renamed **3v** in the docs.)

## Objective
An image uploaded in the admin on a Vercel deployment is still there after the next request and the next deploy, and public pages can show it. Local development and CI keep working with no token.

## The problem (found by reading code, not run)
`Media.ts` saves uploads to `apps/web/public/media`. No storage adapter is configured. Vercel's deployed disk is read-only, so an upload there would fail or vanish. Nothing is committed under `public/media` (`git ls-files` is empty), so there are no existing files to move.

## What I will do
1. Add Payload's Vercel Blob storage adapter (`@payloadcms/storage-vercel-blob`, same version as Payload, 3.93.0), switched on **only when `BLOB_READ_WRITE_TOKEN` is set**. With no token the collection keeps saving to local disk, so development and CI do not change.
2. Keep file addresses as `/api/media/file/<name>` (the adapter's default, which serves the file through Payload and keeps its access rules). So `next.config.ts` and the image `localPatterns` need no change (that file is the main agent's).
3. A small pure rule `mediaStorage(env)` says which mode is in force and returns a warning when the site runs on Vercel without a token; the config prints it at boot (it does not stop the build).
4. Optional `BLOB_READ_WRITE_TOKEN` in `src/env.ts`.
5. ADR-0014 with the decision, the two things it lets us remove, the limits and the reversal.

## What I will not do
Create a Blob store, set any Vercel variable or commit a token (the owner or the main agent does that). No schema change is expected; if one appears I stop and say so.

## Known limit to state, not hide
Vercel functions accept a request body of about 4.5 MB. The CMS rule allows 8 MB (`MEDIA_MAX_BYTES`). Through the server, an upload between 4.5 and 8 MB would fail on Vercel with the platform's error, not our friendly message. The adapter's `clientUploads` option avoids this by sending the file straight from the browser to Blob, but it changes how the file reaches our upload checks (they read the file on the server), so it needs its own slice and test. For the demo: the editor guide tells editors to keep images under 4 MB.

## Risks
1. The adapter changes a generated type or needs a migration (I expect not).
2. The adapter breaks the import map or `generate:types` (run the drift check).
3. Upload checks (`mediaBeforeChange`: type, size, duplicate fingerprint) behave differently when the file is stored elsewhere.

## Gate
Typecheck, lint, unit, integration, `generate:types` drift check, build (with and without a token), existing browser tests. **An upload on a real Vercel preview: not run**, because it needs a Blob store and token that I must not create; the PR says what to check once they exist.
