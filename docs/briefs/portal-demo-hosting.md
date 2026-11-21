# Brief: private hosted portal demo (Sample data only)

**Objective.** Give the owner a link to try the faculty portal without running it locally. Dummy data only (owner decision 2026-11-20); the portal stays a separate system from the university site, the CMS and Odoo.

**What exists (outside the repo).**
- Vercel project `uswat-portal` (own project and origin, per ADR-0020), git-linked to this repo, root `apps/web`, plain `pnpm build` (never `vercel-build.sh`, so no CMS migrations run), Vercel Authentication on for every deployment, and an ignore-build rule so only branch `fp/portal-demo` builds.
- Neon project `uswat-portal-demo` (its own role and password, not shared with the CMS project). Identity migrations 0001 to 0014 applied by hand through the Neon console API.
- Three Sample accounts (`ayesha`, `bilal`, `carol` at `.sample@example.invalid`); `bilal` is a reviewer. All in "Sample Department of Computer Science". Passwords are random, given to the owner in chat only, never stored here.
- Variables are scoped to branch `fp/portal-demo` (preview). Secrets are Vercel "sensitive" values.

**Paths touched in the repo.** This brief and `docs/STATUS.md` only. No code change.

**Risks.** The passkey ID is the deployment host, so the owner must use the branch address, not a per-commit address. Neon free compute sleeps, so the first request may be slow. The Payload (CMS) variables point to the same empty database; CMS pages on this deployment are not meant to work.

**Tests.** Not run against the hosted copy by test suite; checked by loading `/portal/sign-in` and signing in (see STATUS).

**Gate.** Owner signs in with Vercel and tries the portal. To remove everything: delete the Vercel project `uswat-portal` and the Neon project `uswat-portal-demo`.
