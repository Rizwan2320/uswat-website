# Brief P3 slice 3e: Faculty groups, Departments, Programmes, Offices, Campuses, People

Branch `p3/org-3e`, stacked on `p3/post-types-3d` (PR #5). Date 2026-11-10. Plan: v2 7.2 (content model and relationships); Addendum 7.2 (rename to "Faculty groups"), 8 (field mapping); Addendum C FP-06 and the FP agent's reply `docs/briefs/FP-reply-to-p3.md` (branch `p3/faculty-portal-spec`).

## Objective
The organisation records the importer (P4) and templates T3 and T7 need, governed like every other type, with staff contact details protected even though no portal exists yet.

## Paths touched (P3 lane)
New: `src/governance/privacy.ts`, `src/collections/{governedCollection,FacultyGroups,Campuses,Departments,Programmes,Offices,People}.ts`, one generated migration, tests, this brief. Changed: `src/payload.config.ts`, `src/payload-types.ts`, `tests/int/access.matrix.int.spec.ts`, docs. Not touched: `(site)`, `src/site`, `src/design`, tokens, `lib/content.ts`, any portal path.

## Design
- **Relationships, as the plan states:** Programme belongs to Department; Department belongs to a Faculty group; Person belongs to a Department and/or an Office. Membership is stored once, on the child (a department points to its group), so there is one place to change. Heads (department, office) are a relationship to People, supplied by a person (Addendum 8).
- **Fields come from the Addendum mapping table.** Nothing is seeded: no names, phones, addresses or emails are in the repo. Campus addresses are disputed between sources (plan 4.8), so the Registrar decides and a person enters one with its `source`.
- **Faculty groups:** slug `faculties` as in the plan; "Faculty group" in editor-facing text.
- **Personal fields on People (FP-06).** `email` and `photo` each have a `visibility` select: Hidden (default), Staff only, Public. Enforced as a field read rule (`governance/privacy.ts`), so it holds for single reads, lists and populated relationships. Signed-in staff always see values (they need them to edit). Payload rejects an anonymous query that filters on `email`, so a hidden address cannot be probed. **Default hidden is a safety choice**: the importer must set `public` explicitly for addresses the old site already published; Addendum C says defaults should be "the minimum the university already publishes", which the importer can express per record.
- **`facultyStatus`** (current, former, emeritus) on People.
- **Left out on purpose, per the FP agent (rule 9):** `claimedBy`, the `faculty` origin, `onBehalfOf` in the audit entry, and the allow-list rule for portal writes. They are additive and arrive in a small migration if gate G-FP0 passes (Thu 12 Nov). The FP agent's reply agrees `claimedBy` will be an opaque text id.
- **No phone on People.** The mapping gives People name, designation, details and email; FP mentions phone visibility. A `visibility.phone` can be added with the field when a source provides it.
- **Access and scope** are unchanged from 3a and 3b: the same governed rules, owner office text, VER-01.

## Not in this slice (and not run)
- Importer, public templates, getters, search indexing, revalidation tags for these types.
- A per-field risk class: heads of department and office are leadership names (high-impact in the Addendum) but risk class is per record; an editor or the importer raises it on those records.
- REST tests for these types; Playwright.
- Schema change: 40 tables. Generated; down needed `IF EXISTS` on six lines (disclosed, same defect as before).

## Tests
Per type: workflow, VER-01, audit, unpublished record invisible to the public (12 tests); relationships programme to department to faculty group and person to department and office; privacy: defaults, hidden/internal/public, lists, populated relationships, select-only read, query probing, staff see all (7). 19 new; the integration run on an empty database has 243 tests (it includes the unit tests); typecheck, lint (0 errors) and build pass. A mutation check (rule removed) makes 4 privacy tests fail.
