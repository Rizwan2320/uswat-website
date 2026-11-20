# P3 slice 3v: Operations section on the admin dashboard

**Branch:** `p3/operations-3t`, from `main`. **Lane:** `src/governance`, `src/admin`, `payload.config.ts`, tests, docs. **No schema change, no migration.**

## Why
The plan's claim is "the site maintains itself". Today that is invisible: the hourly sweep runs, and a successful run leaves no trace (Payload deletes finished jobs by default). An outside review (11 Nov) asked for a read-only page that makes it visible. I checked what it needs: the sweep already returns a report; nothing stores it.

## What
1. **Keep the sweep's history.** `jobs.deleteJobOnComplete: false`, and the sweep prunes runs older than 30 days (PROPOSED retention, one constant). No new table: Payload's own `payload-jobs` rows keep `completedAt`, `hasError` and the report.
2. **Operations section** above the collection list on the admin home page, for platform admin, site manager and auditor only (the same roles as the settings menu). Read-only. It shows:
   - *Automatic upkeep:* when the sweep last ran, what it did (published, archived, marked Stale, skipped and why), and a plain warning if it has never run, last failed, or is late (no run for 3 hours; PROPOSED, the schedule is hourly).
   - *Work waiting, by office:* drafts, waiting for review, Stale, and expiring within the dashboard's 14 days, from the latest saved version of every governed record.
   - *Images missing alt text:* one number.
3. Pure functions (`summarizeSweeps`, `tallyOffices`) hold the rules so they are unit-tested; a loader reads the database.

## Not showing (honest)
Last import report, broken-link count and "snapshots written": none of these is stored in the database today (the importer writes files; link checking and snapshots are other lanes). The panel does not pretend; it says "not recorded here".

## English only
Like the editor dashboard, the new section is in English. It is for staff who run the site. Urdu for dashboard screens is a later batch.

## Risks
- Every collection is read once per page view of the admin home for these three roles (about 16 queries, five fields, archived items skipped, a 5,000-record cap per collection with a "partial" flag). Fine at current size; to be watched at 10,000+ records.
- Keeping finished jobs grows `payload-jobs` by one row an hour until pruning (about 720 rows steady state).

## Three-in, two-out (rule 9)
Adds: one section and one retention rule. Lets the team remove: the need to open the GitHub Actions log to know whether the sweep ran, and the guess about whether the scheduler is calling the CMS at all.
