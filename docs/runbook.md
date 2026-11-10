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
Called **hourly** by `.github/workflows/lifecycle-sweep.yml` (it calls `handle-schedules`, then `run?queue=lifecycle`, with `Authorization: Bearer $CRON_SECRET`). It needs, in the GitHub repository settings, the secret `CRON_SECRET` (same value as in Vercel) and the variable `LIFECYCLE_BASE_URL`. Until both exist it logs a notice and does nothing.

- **Run it by hand:** open the workflow in the Actions tab and choose "Run workflow". A signed-in platform admin or site manager can also call the run endpoint; nobody else can.
- **Cadence is one setting.** `LIFECYCLE_CRON` in `apps/web/src/governance/schedule.ts` and the `cron:` line in the workflow must be the same text (a unit test checks). Hourly is the default because every five minutes is about 8,600 database queries a month and would likely keep the free Neon compute awake all day. To tighten it, change both together, and check the database plan's compute allowance first. Scheduled publish and expiry are accurate to about one cadence interval.
- **GitHub disables scheduled workflows after 60 days with no repository activity.** If publish, expiry or stale marking stops happening, open the Actions tab and re-enable the workflow (any commit also resets the timer). The public site does not depend on the sweep to hide expired content: current lists check dates at query time.
- If records are not archived or published on time, look at the last runs of that workflow first.
