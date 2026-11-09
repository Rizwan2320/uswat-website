# ADR-0010 Governance policy as one pure module, enforced in collection hooks

- Status: Proposed (P3 slice 3a, branch `p3/cms-core`; not merged)
- Context: Plan v2 7.2/7.3 and Addendum 7 need roles, a five-state workflow, a verification gate (VER-01) and an audit trail. Payload gives access functions (database filters) and hooks. The first integration run showed that a draft save never updates the published row, even for a record that was never published, so any database filter on governance fields (office, status, risk class) can be stale.
- Decision:
  1. All rules live in `src/governance/policy.ts`, a pure module (no Payload imports) that takes the actor, the previous and requested state and returns an error code or the corrected values. A thin `beforeChange` adapter (`hooks.ts`) applies it to every write path (admin, REST, Local API with a user, restore-version, scheduled publish as the system).
  2. Access functions only decide what can be decided from the row: public sees published, staff see by role and office (reads), auditors never write. Scope, contributor-draft-only and delete rules are policy checks on the latest saved state, not row filters.
  3. Two axes stay separate (Addendum 7): Payload `_status` is public visibility; `governance.status` is the five workflow states; `verificationStatus` is a third field. A record can only be `_status=published` when workflow status is published or archived.
  4. Audit entries are written from collection and global hooks with the request's transaction, in an append-only collection. GraphQL is disabled so the policy can tell an unpublish from a draft save (REST carries `?draft=true`; GraphQL does not).
  5. Governance columns are nullable with database defaults; the hook always fills them. Rows without values read as draft and unverified.
- Alternatives considered: Payload field-level access for everything (strips values before hooks run, breaks first-user bootstrap, cannot express transitions); a state-machine plugin (a dependency for something 300 lines of tested code does); database triggers for append-only audit (hand-written SQL in migrations, which the project forbids).
- Evidence: 73 unit tests (policy, audit diff); 40 integration tests on PostgreSQL (role matrix, workflow, VER-01 incl. restore-version, REST unpublish, audit, accounts); predictions P3a-b to P3a-e.
- Consequences: Admin shows edit controls to anyone with write rights on any record they can read; refusals arrive on save with a plain message. Audit log is append-only through the application only. Any new write path must run through collection hooks (not raw database access). Users cannot see each other unless admin, site manager or auditor (post author picking by editors is limited until a public author record exists).
- Cost of reversal: Medium. Policy module is independent; hooks and fields would be removed with a down migration.
- Reversal trigger: Payload changes where draft saves are stored, or a need for per-field approval.
- Owner: Lead
- Review date: at the P3 gate
- Prediction: see `docs/predictions.md` P3a-d (written before the tests): partly wrong on where draft data lives.
