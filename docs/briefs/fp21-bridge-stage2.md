# FP-21 Bridge stage 2: more of the profile on the public page

Date 2026-11-28. FP agent, owner instruction "go ahead for research interest and other". Builds on FP-20 (PR #183, ADR-0029).

## Objective
The public `/people/<slug>` page also shows research interests, office location and office hours, ORCID iD, Google Scholar link, and for each work its year, journal or venue, kind and a featured marker. Changes to the publication list reach the page without pressing the button.

## Design
- **People schema (lead lane, flagged).** New fields, all optional: `researchInterests` (array of text), `officeLocation` (text, 120), `officeHours` (text, 200), `orcid` (text, checksum validated by the portal; the site checks the shape only), `scholarUrl` (https on scholar.google.com). Each publication row gains `year`, `venue`, `workType` (select of the eight portal types) and `featured`. One additive Payload migration; no existing data changes. `contentFields` extended so Fact-check and audit see them.
- **Message (shared contract).** `edit` gains `researchInterests`, `officeLocation`, `officeHours`, `orcid`, `scholarUrl`; each work gains `year`, `venue`, `workType`, `featured`. The receiver treats a missing new key as "not sent" so an older portal build cannot blank them. Limits as the portal's own (interests 15 of 60 characters).
- **Receiver.** Writes the new fields with the same live-values safety net. Language: research interests, office location and office hours are one-language text (as the portal stores them), not localized.
- **Public page (lead lane, flagged).** Interests as a plain list under About; office and office hours in the facts column; ORCID as `https://orcid.org/<id>`; Scholar link; per work "year · venue · kind" under the title and "Featured" text mark. All text is plain; links go through `safeHref`. Sample label unchanged.
- **Automatic send.** After any publications change that succeeds (claim, reject, duplicate, add, import, edit, feature, make public/private, delete, harvest) the portal schedules a send with Next `after()`, so the person's click is not slowed. Unchanged messages are skipped by the stored hash. The button stays for retry.
- **Not changed.** Name, designation, department, status, email address and photo stay out. The visibility choice for email and photo stays as in stage 1. Office location and hours are public once approved (the profile screen already says "Your public details").

## Paths touched
Portal lane: `modules/portal/bridge/{contract,receive}.ts`, `publications/actions.ts`, tests, docs. Outside the lane (PR for the lead): `collections/People.ts`, `migrations/*` (new), `site/people/{shape.ts,PersonPage.tsx,People.module.css}` and their tests.

## Risks
A migration on the live CMS database (additive, nullable columns and one array table; reversible by the down step); a long interest or office text breaking the layout (limits, wrapping, tested at 390px); the automatic send hiding a failure (stored state and the panel still show Waiting); a work with an unknown kind (falls back to "Other"; checked by the allow-list).

## Tests
Unit: contract (new fields, limits, missing keys, unknown kind, bad Scholar or ORCID), `after` trigger skips when unchanged. Integration on a clean migrated CMS database: write and read back, live values kept, migration up and down. Browser: profile text approved then public page shows interests, office, ORCID, Scholar, work details and Featured; hiding a work removes it without pressing the button.

## Gate
Local run green on a clean database; PR open for the lead; nothing applied to the live CMS database. Prediction rows FP21-a to FP21-d.
