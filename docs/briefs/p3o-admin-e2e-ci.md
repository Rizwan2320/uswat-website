# P3 slice 3o: the browser tests run in CI

**Branch:** `p3/admin-e2e-ci-3o`, stacked on `p3/messages-3n`. **Changes shared infrastructure:** one new workflow file, `.github/workflows/admin-e2e.yml`. The existing `ci.yml` is untouched.

## Why
Slices 3j, 3l and 3m each found a defect only a browser could see (a blank create page for editors, drafts visible across offices, menu entries nobody could use). The 14 Playwright tests existed only on my machine, so the next change could break them silently.

## What it does
On pull requests that touch `apps/web/**` (and on pushes to `main`): fresh Postgres 17 service, migrate, production build, create the test people and a live page (`tests/e2e/support/setup.ts`), start the site, run `editor-flows` and `role-views` in Chromium with one worker. Secrets are test-only values written in the file, the same ones `ci.yml` uses. It never touches the live Neon database, Vercel or any real data.

## Cost and risk
About 6 to 10 minutes of runner time per PR. A separate check, not a required one unless you make it so in branch protection. It runs the other `tests/e2e/*` files? No: it names the two specs, because the others import app code that Playwright cannot load.

## Result
See the PR checks. Prediction P3o-a (40% green first time) is recorded with the actual in `docs/predictions.md`.

## Three-in, two-out (rule 9)
Adds: one CI job. Lets the team remove: the manual "open the admin as every role" step before each merge, and the hand-run of the editor flows from the runbook.
