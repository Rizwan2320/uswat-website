# P3 slice 3s: three integrity fixes (delete guard, verifiedBy, default re-check date)

**Branch:** `p3/integrity-3s`, stacked on `p3/delete-drafts-3q` (PR #57). **Lane:** `src/governance`, `src/collections` hooks only if needed, `src/migrations` (one generated migration), tests, docs.

## Why
An outside review (two files from the owner, 11 Nov) listed gaps. I checked each against the code: most were already closed (editors cannot verify; the audit log is append-only; locking is on; the importer will not overwrite a person's work). Three real gaps remain in my lane:
1. **Delete.** Nothing stops deleting a Department that 12 People still point to. Slice 3q lets more roles delete drafts, so this matters more now.
2. **Who verified.** The audit log says who, but the record itself does not, so a public "verified by" line or a report cannot read it from the record.
3. **Re-check dates.** Nothing sets "Check again by" unless a person does, so the Stale state would never fire for ordinary items.

## What
1. `governanceBeforeDelete` (after the permission check, so counts are not shown to people who may not delete) refuses to delete a record that others still reference: the message says how many of what. The fields that point at a collection are found from the built config. Left out on purpose: users (staff must be removable), the audit log, search, Payload system collections, and derived breadcrumbs.
2. New read-only `governance.verifiedBy` (a user). Set to the reviewer when a record becomes Verified, cleared when verification is reset. One generated migration, run against a fresh local Postgres, with a working `down`.
3. When a record is published without "Check again by": standard risk gets +180 days, low risk +365 days (PROPOSED, one constant each in code, not university rules). High impact still must be filled in by a person (unchanged rule).

## Not doing
Payload's "trash" (needs a schema change per collection and does not stop a bad delete by itself). Bulk verify and publish, shared facts, the operations panel, the importer digest: separate decisions or other lanes (see STATUS).

## Risks
- The in-use check adds a few queries to every delete; deletes are rare. A relationship inside a deeply nested block might be missed; the test lists what it finds.
- `verifiedBy` touches every governed collection's table and its versions table. Merging with the Urdu PRs (#52, #69) will need a one-line label or dictionary entry for it (noted in STATUS).
- A default re-check date means every standard item published without a date will go Stale after 180 days. That is the intent; reviewers will see them in the Stale queue.

## Three-in, two-out (rule 9)
Adds: one hook check, one field, one default. Lets the team remove: the manual "who verified this?" audit-log lookup, and the hand-set dates that nobody sets.
