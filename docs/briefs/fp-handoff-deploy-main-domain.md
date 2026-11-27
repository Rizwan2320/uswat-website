# Handoff to the main agent: put the faculty portal on the main domain and link the landing page to it

From: FP agent. Date: 2026-11-22. Requested by the owner (Rizwan Khan, 2026-11-22): "deploy this to the main domain and make the Faculty Portal button on the landing page redirect to it".

I did not do this. It touches the public site (your lane), Vercel production settings and possibly DNS (owner decisions under ADR-0020 section 4 and CLAUDE.md rule 5). Everything below is what you need to do it quickly.

## 1. What to merge first
- PR `fp/registrar-header` into `main` (this branch). It is main plus five commits, tested on top of today's main: typecheck clean; unit and identity integration 1181 of 1181.
  - Registrar's office (the spec's Verifier role): migration `0016_verifier`, screen `/portal/registrar`, `identity:roles grant-verifier|revoke-verifier`.
  - Migration `0015_profile_fixed` (`account_fixed`: Urdu name, designation, picture) which the Registrar now writes.
  - Portal header rebuilt like the public header; wider, shorter pages; small pictures in `public/portal-avatars/`; `scripts/portal-demo-seed.ts` (prints SQL, connects to nothing).
- Main already has the portal up to migration 0014 (review queue, claim and activation, delegation, notifications and digest); PRs #118, #123 and #125 show closed but their files are on main.
- Do not merge `fp/portal-demo`: it is the owner's private hosted-demo branch (empty rebuild commits, demo notes) and is 42 commits behind other lanes.

## 2. Where the portal lives (owner decision needed)
ADR-0020: its own Vercel project and origin, because cookies, CSP and the passkey ID are tied to the host. The owner said "main domain", so ask which:
- **A. A host name under the main domain (for example a `portal.` subdomain), own Vercel project from this repo.** What the ADR chose. Needs one DNS record: the owner's step.
- **B. A path on the existing `uswat-website` project (`/portal`).** The ADR's named fallback: passkeys, cookies and CSP are shared with the public site and the CMS admin. Works only if the owner accepts that.
Either way, passkeys are bound to the host. Demo passkeys do not carry over; everyone re-enrols.

## 3. Production settings (owner enters secrets in the dashboard, never in the repo or chat)
- `PORTAL_ENABLED=true`, `PORTAL_ORIGIN=https://<chosen host>`, `PORTAL_DATABASE_URL` (its own database and role, not the CMS role, and not the demo Neon project), `PORTAL_AUTH_SECRET`. Use the direct (non-pooler) Neon host: the pooler rejects the startup `options` parameter.
- Build command for the portal project: plain `pnpm build`, never `vercel-build.sh` (no CMS migrations from the portal project). The CMS tables must already exist in whatever database the build prerenders against.
- Apply identity migrations 0001 to 0016 to the production portal database (`pnpm identity:migrate up`; remote databases need the owner's `IDENTITY_ALLOW_REMOTE`) BEFORE the code that needs them goes live.
- Do not copy the demo accounts (`*@example.invalid`) or demo passwords. Create real accounts by invitation (`identity:invite`), set departments and roles with `identity:roles` (`grant-reviewer`, `grant-head`, `grant-verifier`).
- Data stays Sample by the owner's decision: the sample banner and "Sample" labels stay on screen.

## 4. The landing page link (your lane: public site)
- `apps/web/src/site/content/site.ts`: `portalLinks.faculty` is `https://cms1.uswat.edu.pk/web/login` with a TODO. It feeds the top bar (`TopBar.tsx`) and the Faculty Portal card (`content/portals.ts`). Point it at `<portal origin>/portal/sign-in`.
- This replaces the link to the university's Odoo login for faculty. The owner asked for it; the student link stays as it is.
- Under option B, use the relative path `/portal/sign-in`. If old bookmarks matter, add a redirect in `next.config` from a short address to `/portal/sign-in`.
- Check the 390 px baselines (including rtl): the link text does not change, so they should not move.

## 5. Known gaps (also in `docs/STATUS.md`)
- AUTH-07: the session does not record whether it began with a passkey; the Verifier check is "account has a passkey, strong session, fresh second factor to save".
- The person is not notified when the Registrar changes their details (the change log is the record).
- Urdu interface (FP-53) is not done; the owner will test it later.
- Delegates need any active portal account; a same-department restriction was offered and is undecided.
- One non-repeating failure in the identity migration test setup, seen once, not explained.

## 6. Evidence
`docs/predictions.md` rows FPV-a to FPV-d and FPT-a; `docs/briefs/fp-verifier-and-header.md`.
