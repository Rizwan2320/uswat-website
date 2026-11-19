# ADR-0014 Media files are stored in Vercel Blob when a token is set, on local disk otherwise

- Status: Proposed (P3 agent, 2026-11-19). The owner said "decide yourself and go ahead" on 2026-11-19; this is a new dependency, so it is open for the owner and the main agent to object in the PR.
- Context: `src/collections/Media.ts` saves uploads to `apps/web/public/media`. Vercel's deployed disk is read-only, so an editor's upload would fail or vanish there. Found by reading code; not run, because production has no users. The plan (section 11, spike S-1) already names "the R2 or Blob storage adapter" for the demo. Nothing is committed under `public/media`.
- Decision: Use `@payloadcms/storage-vercel-blob` (version pinned to Payload's, 3.93.0) for the `media` collection, enabled only when `BLOB_READ_WRITE_TOKEN` is set. Without the token, uploads go to local disk as before. File addresses stay `/api/media/file/<name>`, served through Payload, so access rules still apply and the site's image settings do not change.
- Alternatives considered: (1) Cloudflare R2 with the S3 adapter: free tier, but a separate account and more settings (endpoint, keys, bucket policy) for a demo that already runs on Vercel. Kept as the production choice if the university host is not Vercel. (2) Commit images to git: breaks the editor's job (uploading), grows the repository. (3) Store files in the database: Payload has no such adapter. (4) Do nothing: uploads fail on Vercel.
- Evidence: Predictions P3med-a to d and their results in `docs/predictions.md`. A real upload on a Vercel preview: not run (needs a Blob store and token).
- Consequences: One new dependency and one optional variable. An upload of 4.5 to 8 MB fails on Vercel with the platform's error, because the platform limits a function request to about 4.5 MB while our rule allows 8 MB; the editor guide says to keep images under 4 MB, and `clientUploads` is the later fix. Blob has free-tier size limits; the owner should check them before real use. Files uploaded to local disk before the switch are not moved (there are none in git).
- Three-in, two-out: it lets us remove (1) the need for a writable disk on the host, so the same container can run on a read-only one; (2) the manual copying of image files between the preview and production hosts.
- Cost of reversal: remove the plugin line and the dependency; files already in Blob stay there and would need copying back out. Low while there are only Sample images.
- Reversal trigger: Blob limits or cost are not acceptable; the university host provides its own object storage (then switch to the S3 adapter against it).
- Owner: P3 agent. Decision by the owner: pending.
- Review date: after the first upload test on a preview.
- Prediction: P3med-a to d.
