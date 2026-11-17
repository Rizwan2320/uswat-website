# Brief FP-7: portal pages for the identity flows (sign-in, enrolment, security)

Branch `fp/portal-pages`, stacked on `fp/signin-delay` (PR #36), which sits on #33. Date 2026-11-13.

## Context
The owner told the FP agent on 2026-11-13 that the deadline moved from Tue 17 Nov to **Tue 1 Dec 2026** (owner's statement; the main agent's STATUS has not recorded it yet) and that work may proceed freely. The identity core is built and tested through the route (FP-1 to FP-6), but **no portal page exists**, so nothing a person can see, and the gate has only been tested at the route, not at page level (open item since FP-1). Faculty profiles, claims and delegation still wait for the P3 agent's People collection, which is not on `main`; this slice does not touch them.

## Objective
Pages for the identity flows only, in the portal's own route group, built on the existing tokens, working with the keyboard, labelled "Sample" until real data exists:
- **7a** layout, page-level guard, sign-in (passkey first, password, authenticator-app step), portal home, sign-out.
- **7b** first-factor enrolment (passkey first, authenticator app second with the setup key and an `otpauth` link, no QR library), recovery codes shown once, lost-device sign-in.
- **7c** security page: passkeys listed, add another, regenerate recovery codes, active sessions with revoke.
Each is its own PR so the main agent can review small pieces.

## Design and why
- Server-side guard: a pure `guardPage(pathname, state)` over the same `decide()` the route uses, plus a small server wrapper that reads the session, factors, strength and lifetime exactly as the route does. One shared wiring module (`src/modules/portal/deps.ts`) feeds both, so the page and the API cannot drift.
- When the portal is off every page is `notFound()`; no page opens a database connection at import.
- Client forms use the Better Auth browser client already in the dependency; **no new dependency**. No QR code (a generator would be a new dependency; the setup key and link are accessible anyway). Rule 9 satisfied by adding none.
- Styling in `src/modules/portal/portal.css` on `src/design/tokens.css`; I do not edit the design folder (main agent's lane).
- Accessibility (WCAG 2.2 AA, spec FPR and NFR): every input labelled, one visible heading per page, errors in a live region and linked to the field, focus moves to the heading or error after each step, nothing relies on colour, buttons are buttons, works without a mouse. Checked in the browser run with role queries and keyboard-only steps; no automated accessibility checker is installed in the repo, so that is **not** claimed.
- No user enumeration on any page (same text for unknown email and wrong password); no secrets in the URL; `no-store` on pages that show codes or keys.

## Not in this slice
Profile, publications, claims, delegation (need People); invitation and activation (FP-01, need People and the HOD flow); email alerts (no mailer); step-up before sensitive changes (AUTH-09, next); Urdu text (the portal copy is English first, strings kept in one file so Urdu can follow).

## Tests (before the code)
Unit: the guard table for every page and state; the error-message mapping; the copy file has no empty strings. Browser (virtual authenticator, as FP-6): the sign-in page, the enrolment page and the security page end to end, keyboard only, plus the role-query accessibility checks above.

## Risks
Page and route diverging (mitigated by one wiring module and a test that both refuse the same states). A page that leaks into the public site build (mitigated: the portal route group has its own root layout and 404s when off; the existing build check stays). Time: the pages are the largest piece so far; 7a first, review, then 7b and 7c.

## 7c addendum (2026-11-13): security page
Branch `fp/portal-security`, stacked on `fp/portal-pages` (PR #45). Page `/portal/security` (class `portal`, so a strong session is needed) with: passkeys listed and one more addable; a passkey deletable unless it is the last factor (button hidden and explained; **the server does not enforce this on a direct call, because the library's delete endpoint is not ours; named as a gap, step-up AUTH-09 is the proper fix**); recovery codes regenerated (old ones stop working, shown once); other sessions listed (device text, created time) and revocable, the current one marked and ended with sign-out instead. No new dependency, no new server endpoint. Guard result now carries the factor state so the page does not re-read it. Tests: guard unit (factors present, security page rules), browser run with the virtual authenticator, mutation of the last-factor rule.

