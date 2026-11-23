# FP: own-page publishing for heads and the Registrar, passkey redirect, sign-in and home redesign

Date: 2026-11-23. Branch `fp/self-publish-redesign`. Lane: portal only.

## Objective
Three changes the owner asked for after the first hosted sign-in:
1. After a passkey is saved the page stayed on "saved" and the owner had to click Home.
2. The Registrar's and a head's profile showed "Save and send for review", but nobody can review them.
3. New sign-in and home pages that look modern.

## Decisions
- **A Registrar or head is staff with a profile**, so they keep the page. Nobody reviews their own work in this portal (a reviewer cannot approve themselves), so for these two roles the button is **Save and publish**, with an audit row naming the owner. Sending for review is refused for them on the server, so they cannot lock themselves in a state nobody can clear. The owner asked for this ("hod and registrar should not send to anyone").
- Only the low-risk fields are theirs to edit. Designation, Urdu name and department stay with the Registrar's office (the Registrar cannot edit their own record).
- A reviewer who is not a head is still reviewed by a colleague.
- Risk accepted: a head or Registrar's biography, links and photo visibility change without a second pair of eyes. Every publish is logged in `profile_review` (reviewer = the owner). Revisit before real content; review date with ADR-0027.

## Paths touched
`modules/portal/EnrolFlow.tsx`, `profile/*`, `review/pgStore.ts`, `homeState.ts`, `AuthShell.tsx`, `Valley.tsx`, `icons.tsx`, `SignInForm.tsx`, `copy.ts`, `portal.css`, the portal home, sign-in and recover pages, tests. No schema change, no migration, no new dependency (three-in-two-out: removed `portal-hero.svg`).

## Checks
See predictions FPS-a and FPD-a in `docs/predictions.md`. Not run: the hosted live portal (the changes are not deployed), Urdu interface, a screen reader pass, `tests/unit/env.unit.spec.ts` (needs CMS secrets, fails the same without these changes).

## Gate
Owner looks at the screenshots or the private demo and approves; only then merge (ADR-0027: CI green on the exact commit, fast-forward only, check both deployments and the public home page).
