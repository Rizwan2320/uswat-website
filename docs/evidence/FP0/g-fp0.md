# G-FP0 note (DRAFT, prepared Wed 11 Nov for the Thursday 12 Nov gate)

Main agent, 2026-11-11 (relayed by the owner): the no-go recommendation below is accepted. Thursday's report is the specification plus spike S-2 plus open questions Q1 to Q5, with the importer, redirects and templates stated as not green. The owner's supplied `route_map.csv` is in the repo after a privacy scan (`docs/evidence/FP0/route-map-scan.md`); it is the importer's input, not a built redirect.

Gate definition: Addendum C section 10. The slice starts only if three things are true. This draft marks each, with what I saw and what I did not. The final go or no-go is the owner's; the Must-list line must be re-checked on Thursday before the note is final.

## The three gate conditions
| # | Condition (Addendum C section 10) | State | Basis |
| --- | --- | --- | --- |
| 1 | Must items for importer, templates and redirects are green | **Not met (read Thu 12 Nov, `main` at 051a9cc)** | `docs/STATUS.md` on `main`: redirects built and checked (old addresses answer 301 or 410 from a proxy, every target still 404 until the importer runs); importer not started (the organized data pack is not in the repo and the content importer has no owner); public templates not run (inner-page kit built, templates and revalidation listed under "Not run"). Main agent's own line: G4 as written "will not be met" |
| 2 | S-2 shows the library doing passkeys with UV, TOTP, recovery codes and server-side sessions alongside Payload 3 | **Met, and the first controls are built (PR #16, off by default)** | `spike-report.md` for the spike. Since then: the enrolment gate and TOTP replay guard are built, unit tested and mutation-checked, and pass against the real library on a local PostgreSQL (`docs/evidence/FP1/results.md`). Recovery codes: hashing module built, **no endpoint yet, so PJ3 (lost device) does not work**. Server-side rejection of a UV=0 assertion is proved only in the spike, not in a browser test on this branch |
| 3 | The owner approves the extra scope | **Given for building the identity core (2026-11-11); written DCST approval (Q5) still missing** | The owner asked the FP agent to continue building. Written DCST approval for the portal and for consenting faculty in the demo is not in the repo, so no real faculty data can appear in any demo |

## Per-criterion result (S-2, brief `fp0-faculty-portal.md`)
| Criterion | Result |
| --- | --- |
| Passkey with UV required; UV=0 rejected (FPR-01, AUTH-02) | Pass, only with a non-default setting |
| TOTP enrolment, replay rejected, secret encrypted (AUTH-04) | **Workaround needed**: replay is accepted; own last-step guard |
| Ten single-use recovery codes, hashed, regenerate invalidates (AUTH-05) | **Workaround needed**: encrypted, not hashed; own hashing or owner waiver |
| Server-side sessions, `__Host-` cookie, immediate revocation (SES-01, 02, 05) | Pass with non-default cookie config |
| Mandatory second factor (AUTH-01) | **Workaround needed**: password-only session is granted; own enrolment gate |
| Runs in this app without sharing Payload `users` | Pass (scratch copy, dev and production build) |
| Identity tables respect `push: false` (FP0-d) | Pass; dev reset and CI must also run the identity SQL |
| OIDC federation (AUTH-08) | Not run (P tier). See Q2 below |

## Q2 (owner answer, 2026-11-11)
The owner says the university uses **both Microsoft 365 and Google Workspace** (the owner's statement, no document seen). Whether either tenant enforces MFA is **not known**. Effect on the plan: nothing changes for the C slice, because AUTH-08 is P tier and the portal keeps its own second factor by default; an IdP token is trusted only if it asserts MFA. Two providers instead of one is more work for AUTH-08 later (two issuers, two sets of claims). I have not checked what the library offers for either provider, so nothing is claimed about that.

## Recommendation (draft; updated Thu 12 Nov)
Conditions 1 and 3 are unchanged in substance, so Thursday's report stays as the main agent accepted it: the specification, spike S-2 and Q1 to Q5, with the importer, redirects and templates stated as not green. In addition, the report can say what exists beyond the spec: an identity core (sign-in library wired in, enrolment gate, TOTP replay guard, closed email, SMS and sign-up endpoints, local-only migration runner) in PR #16, dark unless the owner enables it on a separate project. There are no portal pages, no profile claim, no ORCID or OpenAlex harvest and no CV, so none of the C-tier features FP-01 to FP-53 is demonstrable yet.

**No-go for building the C slice** unless the main agent confirms the Must items are green by Thursday evening and the owner approves and supplies Q5. Reasons: condition 1 is not met as of the last status; five days remain after Thursday (Thu to Mon in the Addendum plan) and the slice needs the three controls of our own, tests first, plus PJ1 to PJ8 in CI; the spec says authentication rules are never cut, so a half-built login is worse than none. This matches prediction FP0-c (65% no-go), which is not reconciled until the gate is decided.

**What ships on no-go:** Addendum C (specification and threat model), the brief, ADR-0020, ADR-0023 (Proposed), `docs/evidence/FP0/` (spike report, six result files, scripts, identity SQL) and the predictions. Nothing is deployed and nothing was created in Vercel or Neon.

**If go:** order of work is (1) enrolment gate, TOTP guard and recovery-code decision with tests first; (2) the identity SQL migration as agreed with the main agent; (3) the P3 agent's later People migration (`claimedBy`, `faculty` origin, `onBehalfOf`); (4) propose the second Vercel project's settings and wait for the owner's go; (5) re-run the in-app suite on Node 24 before anything is called done.

## Still needed from the owner
Go or no-go; written DCST approval (Q5); Q1 (what the Odoo Faculty module does), Q3 (who is authoritative for designation and department), Q4 (promotion criteria in writing); whether either tenant enforces MFA.

## Not run
OIDC federation, idle timeout, step-up, delegation, abuse alerts, breached-password check, the in-app run on Node 24 (standalone on Node 24 passed the same), a Vercel deploy, anything on Neon, a Payload custom-strategy alternative, real devices, a re-read of the Must list on Thursday.
