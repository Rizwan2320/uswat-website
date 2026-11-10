# Runbook (CMS operations)

Operational steps that are done by a person, not by the app. Add to this file when a step is found; never put secrets or real personal data in it.

## Nobody can change roles (no platform admin)
When: users exist but none has the role `platformAdmin` (for example, accounts existed before the governance migration ran on a database, so they all became `contributor`). The app cannot fix this, because only a platform admin can change roles.

Steps:
1. Decide, outside the app, which account should be the admin (the earliest created one is usual).
2. Back up, then run once against that database, with the account's email filled in by the person doing it:

```sql
UPDATE users SET role = 'platformAdmin' WHERE email = '<the person''s email>';
```

3. Sign in as that user and set other roles in the admin.
4. Note in `docs/STATUS.md` that it was done and why. The change is not audited by the app, because it bypasses it.

Not applicable to a database where the first account was created through the app: the first account there becomes platform admin by itself.

## Lifecycle sweep (scheduled publish, expiry, stale)
Called every five minutes by `.github/workflows/lifecycle-sweep.yml`. It needs, in the GitHub repository settings, the secret `CRON_SECRET` (same value as in Vercel) and the variable `LIFECYCLE_BASE_URL`. To run it by hand, open the workflow in the Actions tab and choose "Run workflow". If records are not archived or published on time, look at the last runs of that workflow first.
