# Slice 3at: alumni on each page, news and notices kept (2026-11-28, P3 lane)

**Objective.** Every department and programme page has an alumni section its own head or coordinator can change, from their own dashboard. News, notices and events stay in their menu.

**Paths touched.** `collections/academics/pageFields.ts` (`alumniField`), `Departments.ts`, `Programmes.ts` (field added; department short name limit 60), migration `20261128_100642_alumni_on_academic_pages`, `payload-types.ts`, `governance/pageSections.ts` (part and wording), `governance/adminMenu.ts` and `payload.config.ts` (coordinator keeps Posts, Notices, Events), `site/academics/` (`alumni.ts` card type, `cmsContent.ts`, `Alumni.tsx`, both rich pages, styles), `i18n/urWords.ts` (draft Urdu), tests, docs.

**Rule.** Same as the other parts (slice 3ar): rows in the CMS replace the code's alumni; none means the sample cards stay. A row needs a name, a year, a kind and a headline. A link is used only if safe; a photograph only with alt text.

**Not changed.** Access rules; the sample alumni and their work pages in code; the seed (sample alumni are never copied in as real).

**Risks.** New tables: the lead applies the migration. The photograph is personal data: the field says to add one only with consent. Alumni cards have no page of their own (no detail page for CMS entries); the optional link goes to the work.

**Tests.** Unit: card building, merge, part wording and counts. Integration: boards and menu, Urdu coverage, full suite. Browser: both desks, both edit forms, both public pages, axe.

**Gate.** Lead merges PR #171 after CI.

**Open for the owner.** News, notices and events are not yet linked to a department or programme (only to an office, and by tag on the department page). Should each programme page show its own? That needs a department or programme field on notices and events.
