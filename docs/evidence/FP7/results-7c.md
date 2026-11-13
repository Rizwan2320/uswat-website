# FP-7c: security page, evidence

Date 2026-11-13. Same setup as `results.md` (local PostgreSQL 16.15, production build, Chromium with a virtual authenticator).

## Built
`/portal/security`: passkeys listed, one more addable, one removable unless it is the last second factor; recovery codes regenerated (shown once, old ones replaced); other devices listed (browser and system in words, no address shown) and signed out one by one or all together. No new dependency, no new server endpoint. The page guard result now carries the factor state.

## Results
- Browser: `results/security-run-2.json`, 14 of 14. Two earlier attempts crashed before writing a results file: the first on an ambiguous selector, the second on a wrong test design (a recovery-code sign-in correctly ended the first device's session, so the test now signs the first device in again by passkey). Both were test mistakes, not portal changes.
- Unit 363 passed (24 files). `tsc` clean. Lint 0 errors (27 warnings, one new: a `set-state-in-effect` heuristic on the page's first load).
- Mutation check on the last-factor rule: 2 of 2 caught by unit tests. Browser-level mutation not repeated.

## Not run, and gaps
- **Gap:** a direct call to the library's delete-passkey endpoint can remove the last second factor; only the page prevents it. Not a way in for an attacker (it needs a strong session, and an account with no factor can only enrol again), but it can lock a person into re-enrolment. Step-up (AUTH-09) is the proper fix and is not built.
- Old recovery codes refused after regeneration: not re-run in the browser (FP-3 unit and integration tests cover it).
- The keyboard-only check is one reachability test (Tab reaches the Add button); full keyboard flows for the security page were not run. No screen reader, no real device, no https.
- Passkey names are generic ("Passkey 2"); renaming is not built.
