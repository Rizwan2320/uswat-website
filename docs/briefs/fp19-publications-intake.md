# Brief FP-19: more ways to build a publication list (intake, types, featured, privacy, export)

Branch `fp/publications-intake` (from `main` at 28c8421). Date 2026-11-27. Owner instruction 2026-11-26: "decide yourself what should be this plan look like implementing and go ahead", after saying that finding works by ORCID iD alone is not enough. Portal lane only.

## Objective
A faculty member can build and keep a complete publication list without depending on an ORCID lookup: paste a DOI, type a work in, or import a BibTeX, RIS or CSV file; label each work by type (article, conference paper, book chapter, book, thesis supervised, patent, report, other); feature up to five; mark each work public or only mine; add a full-text link; and export the list as BibTeX, RIS, CSV or a plain reference list. The ORCID lookup stays, behind a switch, and can be pointed at OpenAlex.

## Honest starting point
Today "Look for new works" returns a fixed Sample list (DOIs under the reserved 10.5555 prefix). It is not a lookup. The workspace cannot reach Crossref or OpenAlex, so the two real network paths added here are tested with fixtures only and are reported "not run live" until run on the hosted portal.

## Design
- One new path per way in, one shared validator. Every record from a file, a DOI service or a source goes through `validateCandidate`; bad records are dropped and counted.
- Add by DOI is a read-only lookup that fills the same form as "type it in". Nothing is stored until the person presses Add. Adding by hand marks the work claimed straight away (the person is the author asserting it); file imports and ORCID finds arrive as "To review".
- Migration 0017 is additive: `workType`, `origin`, `url`, `featured`, `isPublic` on `identity.publication_candidate`. Existing rows stay valid (type article, origin harvest, public, not featured). Both unique indexes stay, so a hand-typed copy of a known work is refused, not duplicated.
- Featured is at most five per account, enforced in one transaction that locks the account row, so two quick presses cannot make six. Only a claimed work can be featured or made public/private.
- Works that did not come from a source (hand, DOI, file) can be deleted. Harvested rows cannot, because a "not me" must be remembered.
- Outbound calls: server side only, fixed host names (`api.crossref.org`, `api.openalex.org`), no redirects, 8 s timeout, response size cap, only after a signed-in action. The only thing sent is a DOI or an ORCID iD already on the person's own profile.
- Export formats are built on the server from the person's own claimed works; CSV cells that start with `=`, `+`, `-`, `@` are neutralised so a spreadsheet cannot run them.
- Delegates (FP-18) act through the same `accountFor` path as before.
- The public/private choice is stored now; nothing publishes it yet (the portal-to-website bridge is an open owner decision). The screen says so.

## Paths touched
`apps/web/src/modules/portal/publications/**`, `apps/web/src/modules/portal/copy.ts`, `apps/web/src/modules/portal/portal.css`, `apps/web/src/modules/identity/sql/0017_*`, `apps/web/src/modules/identity/migrate.ts`, `apps/web/src/app/(portal)/portal/publications/page.tsx`, portal tests, `docs/`.

## Risks
- A file parser that hangs or blows memory on hostile input (size and record caps, no regex with nested quantifiers, tested with a large and a garbled file).
- Text from a file or a DOI service rendered as HTML (it is rendered as plain text only; URLs only if `http` or `https`).
- The migration breaking the existing identity suite (the migration list test names every migration).
- Crossref or OpenAlex answering in a shape I did not expect (fixtures are written from the documented shape, not recorded; real runs are "not run").

## Tests
Unit: rules (type, URL, authors text), BibTeX, RIS and CSV parsers (including hostile input), formatters (including CSV formula guard), Crossref and OpenAlex mappers with injected fetch (timeout, bad status, redirect refused, oversize), service (session, delegation id, caps). Integration on local PostgreSQL: migration up/down, new store methods, five-featured cap under concurrency, cross-account isolation, delete rules. Browser: all flows at 1440 and 390 px.

## Gate
tsc and eslint clean; unit and identity integration suites pass; browser run of every flow with screenshots viewed; CI `check` passes on the pushed commit; migration applied to the live portal database only after its prediction row and a read-back.

## Not in this slice
Name-and-affiliation suggestions, re-check with a notice, co-author matching, retraction flags, citation counts, HJRS category (FP-13), department roll-up, expert search, publishing to the public page. Listed as roadmap, not built.
