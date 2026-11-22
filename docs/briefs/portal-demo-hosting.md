# Brief: private hosted portal demo (Sample data only)

**Objective.** Give the owner a link to try the faculty portal without running it locally. Dummy data only (owner decision 2026-11-20); the portal stays a separate system from the university site, the CMS and Odoo.

**What exists (outside the repo).**
- Vercel project `uswat-portal` (own project and origin, per ADR-0020), git-linked to this repo, root `apps/web`, plain `pnpm build` (never `vercel-build.sh`, so no CMS migrations run), Vercel Authentication on for every deployment, and an ignore-build rule so only branch `fp/portal-demo` builds.
- Neon project `uswat-portal-demo` (its own role and password, not shared with the CMS project). Identity migrations 0001 to 0014 applied by hand through the Neon console API.
- Three Sample accounts (`ayesha`, `bilal`, `carol` at `.sample@example.invalid`); `bilal` is a reviewer. All in "Sample Department of Computer Science". Passwords are random, given to the owner in chat only, never stored here.
- Variables are scoped to branch `fp/portal-demo` (preview). Secrets are Vercel "sensitive" values.

**One-time exception (owner approved 2026-11-22).** The portal build also prerenders CMS pages, which need the CMS tables. The first successful build ran `db:migrate` against the demo database only (guarded by its host name); the build command was then set back to plain `pnpm build`. The demo database therefore holds 196 empty CMS tables in `public` beside the `identity` schema.

**Address.** `https://uswat-portal-git-fp-portal-demo-rizwan-khans-projects-0d7ccb85.vercel.app` (branch address; `PORTAL_ORIGIN` and the passkey ID are this host). Only pushes to `fp/portal-demo` that change something under `apps/web` build; others are skipped by an ignore rule.

**Paths touched in the repo.** This brief and `docs/STATUS.md` only. No code change.

**Risks.** The passkey ID is the deployment host, so the owner must use the branch address, not a per-commit address. Neon free compute sleeps, so the first request may be slow. The Payload (CMS) variables point to the same empty database; CMS pages on this deployment are not meant to work.

**Tests.** Not run against the hosted copy by test suite; checked by loading `/portal/sign-in` and signing in (see STATUS).

**Gate.** Owner signs in with Vercel and tries the portal. To remove everything: delete the Vercel project `uswat-portal` and the Neon project `uswat-portal-demo`.
