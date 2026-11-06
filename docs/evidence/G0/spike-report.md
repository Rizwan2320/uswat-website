# Spike S-1 report: Next.js + Payload + PostgreSQL (2026-11-06)

Method: `templates/website` at tag `v3.93.0` of the Payload repo, dependencies pinned to 3.93.0, MongoDB adapter swapped for `@payloadcms/db-postgres`, localization added (en, ur with rtl), run against PostgreSQL 17.5 on Node 22.23.4. Scripts are in `scripts/`. Everything was run on a development server in the sandbox, not on the free hosts.

| # | Item | Result | Evidence |
| --- | --- | --- | --- |
| 1 | App boots, schema created on PostgreSQL | **Pass** | `/admin` returned 200; 66 tables (83 with localization) |
| 2 | Drafts hidden from anonymous users | **Pass** | Anonymous query returned 0 docs for a draft page |
| 3 | Validation applies on publish, not on draft save | **Pass** | Publishing without a layout returned 400 "Content > Layout"; draft save succeeded |
| 4 | Versions recorded | **Pass** | 5 versions after 5 saves (`maxPerDoc: 50` in the template) |
| 5 | Localization en/ur, independent values | **Pass, with a condition** | Needs `localized: true` on each field. With it: Urdu title kept after an English edit; Urdu draft save did not change the public Urdu title |
| 6 | Adding localization after data exists | **Risk found** | Drizzle push asked an interactive rename question and stalled the dev server for 2.8 minutes. Decide locales and localized fields before any data; use migrations afterwards |
| 7 | Scheduled publish through the jobs queue | **Pass, with conditions** | Job queued with `waitUntil`; not run before due; ran after due via `GET /api/payload-jobs/run`; version became published; job removed |
| 8 | Job `user` input format | **Finding** | Must be `{ relationTo: 'users', value: id }`; a bare id fails ("auth collection not preserved") |
| 9 | Jobs run from a standalone script | **Fail (by design)** | The template's `revalidatePath` hook needs a Next request context. Run jobs through the HTTP endpoint |
| 10 | External trigger secret | **Pass** | Bearer `CRON_SECRET`: 200; wrong secret: 401; none: 401. A GitHub Actions job can call the endpoint |
| 11 | Plugins present and reachable | **Pass** | redirects, search, forms, form-submissions, media, categories, posts: 200 |
| 12 | Public page renders | **Pass** | `/spike-page` returned 200 |
| 13 | TypeScript 7.0.2 | **Fail** | `baseUrl` removed; type errors in generic helpers. Stay on 5.7.x for now |
| 14 | Per-version access control | **Not run** | Documented in Payload; no test |
| 15 | Live/draft preview in the browser | **Not run** | Needs a browser pass in P1 |
| 16 | R2 or Blob storage adapter | **Not run** | Needs the user's accounts |
| 17 | Vercel, Neon behaviour | **Not run** | Needs the user's accounts |
| 18 | Node 24 or 26, Next 16.4.x | **Not run** | |

Predictions reconciled in `docs/predictions.md`.
