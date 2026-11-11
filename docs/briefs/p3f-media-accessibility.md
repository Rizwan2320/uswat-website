# P3 slice 3f: media rules and the accessibility guard

**Branch:** `p3/media-a11y-3f`, stacked on `p3/org-3e`. **Plan refs:** CMS-06, CMS-08, Addendum 12 MED-01 and MED-03, importer rule 4 (needs-alt queue).

## Objective
An image without alt text, with unknown rights, or of the wrong kind cannot get onto a published page, and a published page cannot skip a heading level or carry a link that says "click here".

## Paths touched (P3 lane only)
`src/collections/Media.ts`, `src/governance/{accessibility,mediaRules,mediaGuard,fields}.ts`, one generated migration, tests, docs. Not touched: `(site)`, `src/site`, `src/design`, tokens, `lib/content.ts`, `modules/identity`, `modules/portal`, `(portal)`.

## What it does
- **Media fields:** `credit`, `rightsStatus` (owned, permission granted, permission pending, licensed, unknown; default unknown), `sourceUrl`, `sourcePage`, `sha256` (read-only, unique). The existing `alt` field is kept (no rename).
- **Upload rules (CMS-06):** JPEG, PNG, WebP and AVIF only (no SVG: it can carry script). Largest file 8 MB. **The 8 MB figure is a proposal, not a university rule**; it is one constant, `MEDIA_MAX_BYTES`.
- **Alt:** a person must give alt text when uploading, and cannot blank it later. The system (importer) may create an image with no alt; `NEEDS_ALT_WHERE` is the queue filter for the editor dashboard.
- **Rights:** only an approver, site manager or platform admin can record rights. An editor's upload is always `unknown`.
- **Duplicates:** the hash comes from the bytes, never from the request. A second upload of the same bytes is refused with the existing record's id (`MEDIA_DUPLICATE`, 409).
- **Publish guard (CMS-08, MED-03):** when a document is being published, every governed collection checks the merged document. It reads the collection's own field config, so there is no list to keep in sync. It finds images in upload and relationship fields, groups, rows, tabs, arrays, blocks and rich text, and blocks the publish for: image with no alt (`MEDIA_ALT_MISSING`), image with unknown rights (`MEDIA_RIGHTS_UNKNOWN`), a heading that jumps more than one level (`HEADING_LEVEL_SKIPPED`), a link whose text is "click here", "here", "click", "this link" or "link" (`LINK_TEXT_BARE`), including the `link.label` field. Headings are judged across the page in field order, and the first heading may be H2 (the page title is the H1). Drafts save with any of these faults. The lifecycle sweep publishes through the same hook, so a scheduled publish is refused and reported too.

## Decisions for the owner
1. **`permission_pending` may publish.** Addendum 12 allows it only in the competition demo with a visible mark. The mark is a template concern (main agent), so the CMS does not block it. If production must never use it, change `RIGHTS_BLOCKING` in `mediaRules.ts`.
2. **Existing media rows** become rights `unknown` when the migration runs (the column default), so none can be used on a newly published page until a reviewer records its rights. Merging runs the migration on live Neon; it is additive and the down step is proven.
3. **Editors cannot edit an image after upload** (existing rule: only reviewers update media). An editor who uploads an image must ask a reviewer to set its rights.

## Deliberately not built (rule 9)
Image variants (MED-02) and per-slot minimum widths (MED-04): Payload's image sizes already generate the sizes the templates use, and the slot check needs the templates, which are the main agent's. The heading and link rules see only rich text and the `link` label; they cannot see headings inside coded template components (axe in CI is the check for that).

## Risks
- The check reads the stored media row, so changing an image's alt or rights later does not unpublish pages that already use it. Re-checking on a media change is a later item.
- `permission_pending` (above).
- Lexical JSON shape is from the editor's documented format, and tests use hand-built JSON of that shape (prediction P3f-c).

## Tests
Unit 23 (rules, walker, problem list). Integration 15 on a real PostgreSQL 16 with real image bytes: alt, importer, needs-alt queue, hash, duplicates, type and size, rights roles, each publish block, draft save, status-only publish, scheduled publish. Mutation check: unwiring the guard fails 6 tests. Whole suite 292 passed on an empty database after `payload migrate`; typecheck, lint (0 errors) and `next build` pass. **Not run:** an HTTP upload (Payload's global `upload.limits` is not set), Playwright, admin-generated Lexical JSON.

## Gate
CI green; main agent review; the user approves before merge. Only the user merges.
