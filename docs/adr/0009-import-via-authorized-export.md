# ADR-0009 Import from a data pack, idempotent, drafts only

- Status: Proposed (agent 4, 2026-11-12; the main agent accepts)
- Context: MIG-01 asked for an importer from an "authorized export". Addendum section 8 replaced that with a crawl-based data pack plus `route_map.csv`. The pack is not in the repository or in this session; it is supplied by the owner and stays out of git. The importer must be safe to run twice, must not invent values, must not publish anything, and must not touch the production database.
- Decision:
  1. **Input.** `SWAT_IMPORT_PACK_DIR` names a folder holding the pack. Contract v0 (a proposal; unverified against the real pack): `news_posts.json`, `notices.json`, `events.json`, `jobs.json`, `tenders.json`, each an array (or `{ "items": [...] }`) of `{ url, title?, date?, categories?, excerpt?, text?, attachments?: [{ label?, url }] }`. The route map (`scripts/import/data/route_map.csv`) decides the collection and the new address of each record; the pack supplies content. Only `normaliseRecord` in `scripts/import/contract.ts` knows this shape.
  2. **Outcome for every route row, exactly one:** `create`, `update`, `unchanged`, `review`, `redirect-only`, `listing`, `gone`, `deferred`, `skipped` (with a reason). They sum to the row count.
  3. **Key and change check.** The key is the old address stored in `governance.source`. Each record carries `governance.sourceContentHash` (hash of the mapped source content). A second run compares hashes and writes nothing when they match. An update is allowed only on a draft that is still `origin: importer` and `unverified`; otherwise the row is reported as `review`.
  4. **Drafts only.** Every record is created as a draft, `origin: importer`, `verificationStatus: unverified`, `collectedAt` set (crawl date 6 Nov 2026, from Addendum section 8). The importer never sets a publish date it was not given, an owner office, or a closing date.
  5. **Personal data.** Email addresses and phone numbers are removed from title, excerpt and text; `mailto:` and `tel:` attachment links are dropped. Each is counted as "contact withheld". Values are never logged or committed.
  6. **Writes.** Dry run by default. `--apply` is refused unless the database host is local. The importer acts as the system (no user), uses the CMS Local API so the governance hooks run, and passes `disableRevalidate` (drafts change no public page).
  7. **Fixtures** committed under `scripts/import/fixtures/sample/` are invented and say Sample.
- Alternatives considered: key on a new `legacyUrl` column everywhere (needs a P3 change to `posts`; kept as an addition where the field exists); fetch from the live site (forbidden by the brief); upsert without a hash (adds one version row per record per run; see prediction A4-b).
- Evidence: unit and integration tests in this PR; `docs/predictions.md` A4-a and A4-b.
- Consequences: first real run is blocked until the pack arrives and `normaliseRecord` is checked against it. Non-article collections need their own mappers.
- Cost of reversal: low; imported drafts carry `origin: importer` and a source key, so they can be listed and removed.
- Reversal trigger: the real pack differs from contract v0 in more than field names.
- Owner: agent 4; accepted by the main agent.
- Review date: when the pack arrives.
- Prediction: A4-a, A4-b.
