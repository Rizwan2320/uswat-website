# Brief FP-10: clean-up of expired identity rows

Branch `fp/identity-cleanup`, from `main` (3c7dd7e). Date 2026-11-18.

## Objective
Remove what can no longer be used, so the identity tables do not grow without end and the "old session row stays" limit named in FP-8 is closed: expired and idle sessions (with their assurance and shared flags), expired `verification` rows, stale sign-in counters, stale recovery windows, and old TOTP replay marks. Run by a script (`pnpm identity:purge`, with `--dry-run`). Scheduling it is the main agent's or the owner's decision (a cron on the portal project); I do not add a route or a cron.

## Rule that matters
The purge must never remove a session the lifetime check would still accept, and never remove a counter or mark that still changes an answer. So every cut-off is the SAME constant the check uses (`IDLE_MS`, `SHARED_IDLE_MS`, `ABSOLUTE_MS`, `DECAY_MS`, `LOCK_WINDOW_MS`, `REPLAY_WINDOW_MS`), and a test compares the purge against `evaluateSession` across many ages.

## Safety
Same target guard as the migration runner (local databases only unless the owner sets `IDENTITY_ALLOW_REMOTE`); `--dry-run` counts and changes nothing; deletes in one transaction; touches only schema `identity`; no personal data is read or printed (counts only).

## Tests before code
Integration (real PostgreSQL), boundaries on both sides of every limit; cascade of the assurance and shared rows; idempotent second run deletes nothing; dry run changes nothing; property-style comparison with `evaluateSession`; recovery codes, passkeys, users and accounts untouched. Mutation: each cut-off moved by one limit, each table dropped from the purge, dry run that deletes.

## Not in this slice
A schedule; deleting users or accounts (that is a data-protection decision); keeping an audit trail of purged rows.
