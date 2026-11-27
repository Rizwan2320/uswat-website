# ADR-0027 The FP agent merges its own portal pull requests

- Status: Accepted (owner instruction, 2026-11-23)
- Context: Rule 8 in `CLAUDE.md` says only the lead merges. The faculty portal is now live as its own Vercel project (ADR-0020) and the owner wants the FP agent to push portal work directly, instructed by the owner, so the lead is free for the public site and the CMS. Every push to `main` deploys both Vercel projects (`uswat-website` and `uswat-faculty-portal`), so a portal merge also redeploys the public site.
- Decision: The FP agent may merge its own pull requests into `main` when all of these hold.
  1. Every changed path is inside the portal lane: `apps/web/src/modules/identity/**`, `apps/web/src/modules/portal/**`, `apps/web/src/app/(portal)/**`, `apps/web/public/portal-avatars/**`, `apps/web/scripts/identity-*.ts`, `apps/web/scripts/portal-*.ts`, `apps/web/tests/{int,unit}/{identity,portal}/**`, and the FP docs (`docs/briefs/fp*`, `docs/briefs/FP-*`, `docs/adr/002[0-4]-*`, `docs/adr/0027-*`).
  2. CI checks `check` and `browser` (where CI runs it) have passed on the exact commit.
  3. The merge is fast-forward only, with no force-push and no history rewrite.
  4. It does not edit schema or migrations of the CMS (`src/migrations/**`, `src/collections/**`, `src/globals/**`, `payload.config.ts`), design tokens, routes outside `(portal)`, `src/site/**`, `src/governance/**`, the CMS Vercel project, or the CMS Neon project. A PR that needs any of these goes to the lead.
  5. It does not change Vercel settings, secrets, domains or DNS. Those stay with the lead and the owner.
  6. Portal identity migrations (`apps/web/src/modules/identity/sql`) may be merged by FP, but applying them to the live portal database is not part of this decision. The lead applies them unless the owner says otherwise.
  7. After merging, FP verifies that both deployments are READY and writes the result in `docs/STATUS.md`.
  Everything else in `CLAUDE.md` still binds FP: the owner instructs, no invented facts, nothing real in the demo, no secrets in the repo, small Conventional Commits, predictions before drills or migrations, and "not run" where something was not run.
- Alternatives considered: FP opens PRs and the lead merges (status quo, slower and ties up the lead); full access including Vercel settings, the portal database and DNS (rejected for now, higher blast radius, owner chose the narrow option).
- Evidence: the owner's choice on 2026-11-23, "Merge its own portal PRs only".
- Consequences: a portal-only merge redeploys the public site too, so FP checks the public home page after each merge. A mistake in the portal lane can reach production without the lead's review, which CI and the path limit are meant to catch.
- Cost of reversal: low. Revert rule 8's exception in `CLAUDE.md` and this ADR.
- Reversal trigger: a portal merge breaks the public site or touches a path outside the lane; or the owner withdraws the permission.
- Owner: the owner (Rizwan).
- Review date: 2026-12-07.
- Prediction: none, because nothing is run or migrated by this decision.
