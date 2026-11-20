# P3 slice 3y: a programme has an apply link

**Branch:** `p3/programme-apply-3y`, stacked on `p3/post-fields-3x` (both add a migration to `src/migrations/index.ts`, so they go in order). **Lane:** `src/collections/Programmes.ts`, `src/migrations` (generated), tests, docs. **Schema change: yes, one generated migration. No new dependency.** Source: plan FR-05 and template T4 ("Programme page: level, duration, eligibility, apply link to the Odoo portal; an empty field hides its row") and the site note in `docs/briefs/p5-organisation.md` ("an apply link on T4: no such field in the CMS"). The owner said "implement them" on 2026-11-20.

## Decision
1. Add `applyUrl` to `programmes`: label "Apply link", one text field, not localized, shown to editors with a hint that an empty field hides the Apply button.
2. **I do not fill it with any address.** Where applicants apply is the university's admissions portal, and no address for it is in the repo or the plan; an invented one would break the no-invented-facts rule. The field stays empty until an editor enters the real one, and the site hides the row when it is empty (FR-05).
3. The field is checked with `safeHrefValidate`, the same rule as attached files: an https address, mailto, tel or a path on this site; `javascript:` and the like are refused (checked at publish, as Payload does for every validator).
4. **The two existing link fields on programmes (`curriculumUrl`, `feeLink`) had no such check** while the site renders them as links. They get the same validator in this slice. This is a rule, not a schema change, so the migration is unaffected. No seed or test writes values to those two fields, so nothing existing breaks (checked by searching `src`, `scripts` and `tests`).
5. It counts as a content edit (governance/hooks.ts), like every other programme field.

## Not doing
- No change to the site (`src/site/organisation/Pages.tsx` is the main agent's: they add the Apply button, reading `applyUrl` through `safeHref`).
- Nothing that touches the Odoo portal or its address.
- No index: nobody searches programmes by apply link.

## Risks
1. A generated `down` that fails: drilled, predicted first.
2. Tightening `feeLink` and `curriculumUrl` could refuse a value already stored. Mitigation: a check of the local database for stored values that fail the rule before I claim it is safe; production holds Sample content only.

## Gate
Typecheck, lint, tests, build, no drift, migration drilled on a populated copy and an empty database.
