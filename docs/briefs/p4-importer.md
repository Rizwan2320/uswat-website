# Brief: importer (MIG-01), agent 4, 2026-11-12

- **Objective.** Load the article types (News, Notices, Events, Jobs, Tenders) from a data pack into the CMS as unverified drafts, idempotently, with a skipped-records report that gives a reason for every row of the route map. Dry run is the default.
- **Paths touched.** `scripts/import/**` (core, fixtures), `apps/web/scripts/import.ts` (thin entry that opens Payload; same place as `routemap-build.ts`), `apps/web/package.json` (one script, `import:run`), tests under `apps/web/tests/`, `docs/adr/0009-*`, `docs/predictions.md`, `docs/STATUS.md`. Nothing under `src/collections`, `src/governance` or `src/migrations`.
- **Risks.**
  1. The pack is absent, so the input shape is my proposal (ADR 0009, "contract v0"); the one function that reads it is the only place to change when the real pack arrives.
  2. Writing to the wrong database. The `--apply` flag is refused unless `DATABASE_URL` points at this machine (localhost, 127.0.0.1, ::1); a Neon or Vercel host is refused even then.
  3. Personal data: email addresses and phone numbers are removed from title, excerpt and text and counted ("contact withheld"); `mailto:` and `tel:` attachment links are dropped and counted. Values are never printed or committed.
  4. Overwriting a human's work: a changed source record only updates a draft that is still unverified and still an importer record; anything else goes to the report as "needs review".
- **Tests.** Unit: planner (every route row lands in exactly one outcome, outcomes sum to the row count, every skip has a reason), redaction, idempotent plan. Integration on a real local PostgreSQL: first run creates, second run writes nothing (version rows unchanged), changed source updates a draft, verified record is left alone.
- **Gate.** Two runs give identical counts; every skip has a reason; a query finds no imported record that is published or verified.
- **Scope of this PR.** Article types only (`posts` as News, `notices`, `events`, `jobs`, `tenders`). Pages, Departments, Programmes, Offices, People, Campuses, Documents, MeritLists, AffiliatedColleges and ContactDirectory rows are reported as `deferred` with that reason and get their own PRs (the organisation collections wait for PR #7).
- **Key.** The plan says "keyed by `legacyUrl`", but `posts` has no `legacyUrl` field (P3 lane). The key is therefore `governance.source`, which Addendum section 8 rule 1 already sets to the old address on every imported record; `legacyUrl` is also filled where the collection has it. If the P3 agent adds `legacyUrl` to `posts`, the writer fills it with no other change.
- **Field name.** The plan says `origin: import`; the CMS option is `importer`.
