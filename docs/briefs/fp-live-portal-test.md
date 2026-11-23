# Brief: first-use test of the live faculty portal

**Owner instruction (2026-11-23, Rizwan, in chat):** the FP agent may create and remove Sample test accounts in the live faculty portal database (Neon project `uswat-portal`, `ancient-wind-92734637`) so the portal can be tested end to end as in real use. This is narrower than ADR-0027 (which does not cover the portal database) and covers account and role rows only: no migrations, no Vercel settings, no secrets in the repo.

**Objective.** Run the real order of use on https://uswat-faculty-portal.vercel.app: operator creates the Registrar and one department head; both sign in and enrol passkeys; a faculty member is invited, claims, is activated by the head, gets designation from the Registrar, completes and submits a profile, and the head approves it. Then publications, courses, CV, delegation, notifications, security and the checks that must fail.

**Paths touched.** Data only, in the live portal database: `identity.user`, `account`, `account_department`, `account_fixed`, `reviewer_role`, `head_role`, `verifier_role`, `invitation`. No code.

**Rules held.** Sample data only: `@example.invalid` emails, names and departments already used in the demo. No real person, no real email. Passwords are random, shown to the owner in chat only, never in the repo. The Registrar's own designation is set by the operator because he cannot edit his own record.

**Risks.** Test accounts on the live host; passkeys are bound to the host. The database is empty at the start, so the test data can be removed completely afterwards (`identity:purge` or a scoped delete of the rows above) and the owner is told when it is done.

**Gate.** The owner confirms the removal list before cleanup; STATUS.md records what was created and removed.
