# FP-10: clean-up of expired identity rows, evidence

Date 2026-11-18. Local PostgreSQL 16.15. No browser run: nothing visible changed. No Neon, no Vercel, no live data.

## Built
`src/modules/identity/purge.ts` (`purgeExpired(pool, now, { dryRun })`) and `pnpm identity:purge [--dry-run]`. It removes, in one transaction: sessions past the absolute 12 hours or idle past their own limit (15 minutes when shared, else 30), with their assurance and shared rows by cascade; expired `verification` rows; sign-in counters older than the 1-hour decay; recovery windows older than 15 minutes; TOTP replay marks older than 120 seconds. Every cut-off is the constant the check uses. It reads and prints counts only. The script refuses a remote database unless the owner sets `IDENTITY_ALLOW_REMOTE`. No schedule, no route, no cron: that is the owner's or the main agent's decision.

## Results
- Integration: 49 passed in the identity file, 8 new tests on real PostgreSQL: both sides of every limit, shared vs unshared, cascade of the flag rows, 154 session ages compared with `evaluateSession` (never removes one it would accept), counters and marks, a recovery window just inside 15 minutes, idempotence and dry run, and users, accounts, passkeys, recovery codes and two-factor secrets untouched. Unit 513 passed. `tsc` clean, lint clean on the files touched.
- Mutation checks: 10 mutations. Eight caught for the right reason after I redid two that had broken the SQL (see predictions). Two (dry run only selects, or only rolls back) are equivalent on their own because the dry run has both safeguards; removing both is caught.
- Script on a scratch database: dry run reported 1 session, 4 verification rows and 9 TOTP marks; the real run removed the same; a second run removed none. Pointing it at a remote host was refused. I did not check the script's exit codes.

## Not run, and limits
- Scheduling: not set up. Until it is, rows stay (harmless: an expired session cannot be used without its cookie).
- Behaviour on a large table or under concurrent sign-ins: not run. The deletes take row locks for the length of one transaction.
- No audit trail of what was removed (counts only).
- Users and accounts are never deleted here; that is a data-protection decision for the owner.
