# Brief P3 slice 3b: governed collections and role access on every collection

Branch `p3/collections-3b`, stacked on `p3/cms-core` (PR #1, not merged), because it uses `withGovernance`. Date 2026-11-09. Plan: v2 7.2, 7.3; Addendum 7.2 edits, 8 (field mapping), 17.

## Objective
1. Add the four collections the Addendum names: AffiliatedColleges, MeritLists, ContactDirectory, ArticleTags, each with the governance group, the workflow policy and the audit log from slice 3a.
2. Close a CMS-02 gap found while planning: slice 3a covered Pages, Posts and Users only. Categories, Media, redirects, forms, form submissions and the Header and Footer globals still use the template's "any signed-in user may write". An auditor or contributor could edit navigation or delete redirects. Give every collection and global an explicit role rule, and test the whole matrix, not a sample.

Requirements: CMS-02 (role matrix, now complete), plus the data model rows of Addendum 7.2. Not in this slice: scheduled publish and expiry (LIF), media rules (alt text, size), accessibility guard, editor dashboard, public templates T6/T7, importer, search indexing and revalidation for the new types (they arrive with the templates in P5).

## Paths touched (P3 lane)
New: `src/collections/{AffiliatedColleges,ContactDirectory,MeritLists,ArticleTags}.ts`, `src/governance/staffAccess.ts`, tests, one generated migration, this brief. Changed: `src/payload.config.ts`, `src/governance/plugin.ts`, `src/collections/Posts/index.ts` (adds `tags`), `src/payload-types.ts`, `docs/predictions.md`, `docs/STATUS.md`. Not touched: `(site)`, `src/site`, `src/design`, tokens.

## Design
- **Fields come from the Addendum field-mapping table (section 8) only.** Nothing is invented; no data is committed.
  - AffiliatedColleges: `name`, `sector` (text), `number` (number) [the importer key is sector + number], `programmes` (list of names), `affiliationYear`, `address`, `link`.
  - ContactDirectory: `section`, `name`, `phones` (list), `email`, `hours` [key: section + name].
  - MeritLists: `title`, `legacyUrl` [key: old URL], `documents` (list of label + PDF URL), `admissionCycle` and `programme` as text until the AdmissionsCycles and Programmes collections exist (P4), then relationships by a later migration.
  - ArticleTags: `name`, `slug`, `aliases` (search synonyms such as "CS"); Posts get `tags` (other old categories become tags, Addendum 8 rule 1).
- Localized: name, title, address, hours, programme names, tag name. Not localized: numbers, dates, phones, emails, URLs (plan 7.2).
- All four use `withGovernance` with drafts, so the same workflow, VER-01 gate, owner-and-source rule and audit apply. Default risk class is Standard. Merit lists (admission outcomes) should be High-impact; the importer sets that, editors can raise but not lower it.
- **Staff access table** (`governance/staffAccess.ts`), applied by the governance plugin so it also covers plugin-made collections:

| Collection or global | Read | Create | Update | Delete |
| --- | --- | --- | --- | --- |
| Categories | public | platform admin, site manager | same | same |
| Media | public | any staff except auditor | any staff except auditor | platform admin, site manager |
| Redirects, Forms | unchanged (signed in) | platform admin, site manager | same | same |
| Form submissions | platform admin, site manager, auditor | public (the form) | platform admin, site manager | platform admin |
| Header, Footer | public | n/a | platform admin, site manager | n/a |

  Matches plan 7.3: site manager owns navigation and redirects; auditor edits nothing; contributor drafts only (Media upload is allowed because a draft needs a picture; media rules come later).

## Assumptions to confirm
1. Fields exactly as above; `sector` is free text because the Addendum gives no values.
2. ArticleTags are governed like everything else (draft, verify, publish) even though they are low-risk; one rule is simpler than an exception.
3. MeritLists default to Standard until the importer sets High-impact.
4. Form submissions are readable by the auditor (compliance) but never by editors, approvers or contributors (personal data).
5. Search collection left as the plugin defines it (written only by the plugin through the Local API); see Risks.

## Risks
- A migration touching `payload_locked_documents_rels` will likely hit the same generated-down clash as slice 3a (predictions P3a-c). I expect to make the same one-line fix per new collection and will say so.
- Stacked PR: if PR #1 changes in review, this branch is rebased on it.
- Access tightening can break the template admin flows for roles that could write before (that is the point); e2e not run.
- Search plugin collection access is not changed here; it is written only through the Local API, but REST access is not asserted by a test unless the matrix shows it (the matrix covers it).

## Tests
- Role matrix over **every collection and global in the config**, calling the real access functions with a user of each role (CMS-02). Written before the fix, run first, failures recorded.
- Structural guard: every collection with drafts has the governance group, the policy hook and the audit hooks.
- Lifecycle journey per new collection on PostgreSQL: editor drafts, approver verifies and publishes, public reads, unverified is refused, audit entry exists.
- Not run: Playwright, public templates (do not exist yet).

## Gate (slice)
Matrix and journeys green locally and in CI; migration generated, up/down/up proven on a fresh database; typecheck, lint, build pass. Anything else "not run".
