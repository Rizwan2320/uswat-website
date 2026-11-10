# Brief P3 slice 3c: lifecycle (expiry, scheduled publish, stale, review queue)

Branch `p3/lifecycle-3c`, stacked on `p3/collections-3b` (PR #2, not merged). Date 2026-11-09. Plan: v2 7.3; Addendum 7 (LIF-01 to LIF-04, stale content).

## Objective
Make time part of the content rules, without a person having to remember:
- LIF-01: a published record is archived when its `expireAt` passes.
- Scheduled publish: an approved record is published at `governance.publishAt`.
- Stale: a verified published record whose `reviewDueAt` has passed becomes Stale and joins the reviewer queue.
- LIF-02: notices age out of current lists after 90 days unless pinned or given an expiry.
- LIF-03: a new draft made by the importer or the watcher is announced once, and appears in the reviewer queue.
- LIF-04: a type can require an expiry before a record leaves Draft.

## Paths touched (P3 lane)
New: `src/governance/{lifecycle,sweep,jobs,notify}.ts`, `.github/workflows/lifecycle-sweep.yml`, tests, one generated migration, this brief. Changed: `src/governance/{policy,hooks,fields,audit,plugin,roles,staffAccess}.ts`, `src/payload.config.ts`, `src/endpoints/seed/index.ts` (type narrowing only), `src/payload-types.ts`. Not touched: `(site)`, `src/site`, `src/design`, tokens.

## Design
- **Two layers, kept apart.** What is *current* is decided at query time from dates (`currentWhere(now, {ageOutDays, dateField})`), so an expired record never shows in a current list even if the sweep is late. The sweep (`runLifecycleSweep`) then records the change and writes the audit entry. Public templates will use `currentWhere`; they are not built yet (P5).
- **Sweep runs as the system, one record per transaction with its audit entry.** Archive and mark-Stale use a partial `payload.db.updateOne` on `governance` only. Payload's `update` would take the latest draft as its base and publish it, so it cannot be used for these two (predictions P3c-a, P3c-b). A pending draft revision is left untouched. Scheduled publish uses `payload.update`, so the whole policy applies: an unverified record is refused and reported in the sweep report (VER-01), and something already expired is never published (`ALREADY_EXPIRED`).
- **The sweep never verifies or approves anything.** It can only apply a decision a person already made.
- **Task.** `lifecycleSweep` is a Payload task with a 5-minute schedule on queue `lifecycle`. Payload does not run schedules by itself: something outside the app must call `GET /api/payload-jobs/handle-schedules` and then `GET /api/payload-jobs/run?queue=lifecycle`, both with `Authorization: Bearer $CRON_SECRET`. **The caller is GitHub Actions** (decided by the user 2026-11-10): `.github/workflows/lifecycle-sweep.yml` runs every 5 minutes and calls the two endpoints. It does nothing until the repository has the secret `CRON_SECRET` (same value as in Vercel) and the variable `LIFECYCLE_BASE_URL`; if either is missing it logs a notice and exits cleanly. Scheduled workflows only run from the default branch, so it starts after the merge to `main`. While Vercel Deployment Protection is on, an optional secret `VERCEL_AUTOMATION_BYPASS_SECRET` lets the call through. The script was run against a local fake server (header, success, 401 and skip paths); the real workflow and the real endpoints were not run.
- **Reviewer queue.** `reviewQueueWhere()`: in review, drafts from importer or watcher, and Stale. The editor dashboard that shows it is a later slice.
- **Notification adapter.** `Notifier` interface; the demo adapter logs one line. `setNotifier` swaps in email or a webhook later. Fired from `afterChange` on create only.
- **Expiry requirement.** `withGovernance(config, fields, { expiryRequired: true })` makes the policy refuse any save that leaves Draft without `expireAt` (`EXPIRY_REQUIRED`). Assumption: judged when the record leaves Draft, so a draft can be saved while someone is still finding the date.
- **Two scheduling mechanisms exist.** Pages and Posts keep Payload's native `schedulePublish` (draft versions). The new `governance.publishAt` is used by the sweep for governed records. They are not combined on one record; the editor guide must say which to use.
- **Schema change** (generated, not hand-written): `payload_jobs_stats` table, `payload_jobs.meta`, and `lifecycleSweep` in two job enums. Payload adds the stats global while sanitising, after plugins, so its access rule (read: admins, update: nobody) is applied to the finished config in `payload.config.ts`, and it is excluded from the audit log.

## Tests
- 22 new unit tests (policy expiry, `dueAction`, `currentWhere`, `reviewQueueWhere`, notify). Total unit 116.
- 10 new integration tests on real PostgreSQL with injected time: archive with audit entry, not before expiry, idempotent, pending draft and content untouched, stale and queue, scheduled publish, VER-01 on scheduled publish, no publish of expired, current lists, one notification per importer draft, task run through the job queue. Total 197 (unit included) on an empty database.
- Whole-config access matrix updated for the new global.

## Not run, or not covered
- No real collection sets `expiryRequired` or age-out yet (News, Notices, Events, Jobs, Tenders do not exist). LIF-04 and LIF-02 are tested at policy and query-builder level, and `currentWhere` against real rows; the hook-to-policy wiring of `expiryRequired` has no collection-level test.
- No external scheduler call, no Vercel or Neon run, no Playwright, no email adapter.
- Sweep processes 100 due records per collection per run; `truncated` flags more and the next run continues. Not load-tested.
- Archived records still carry `_status: published`; whether public read access should also hide `governance.status = archived` is decided with the public templates (P5).
