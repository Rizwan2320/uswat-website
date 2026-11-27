# ADR-0028 Publication list: add by DOI, by hand and by file, with two outbound lookups

- Status: Accepted (owner instruction, 2026-11-26: decide and implement)
- Context: The only way to get a work into the portal was a harvest keyed on an ORCID iD, and that harvest is a fixed Sample list today. Many works have no ORCID entry (books, Urdu journals, conference papers, older work), and the owner judged the feature too thin.
- Decision: Add three intake paths (DOI lookup that pre-fills a form, a manual form, BibTeX/RIS/CSV import), work types, a full-text link, featured (max 5) and public/private flags, and export in four formats. Add two outbound HTTPS lookups: Crossref by DOI (on) and OpenAlex by ORCID (off until `PORTAL_PUBLICATIONS_SOURCE=openalex`). No new dependency: the three file formats are parsed by small pure functions in the repo. All input from any path goes through the one validator.
- Three-in, two-out (rule 9): no dependency is added. Two things it lets us remove: the dependence on a working ORCID lookup for the feature to be useful (the portal works with the lookup off), and the need to retype a publication list into the CV and the public page by hand (one list, exported or later published from one place).
- Alternatives considered: a BibTeX or RIS library (rejected: dependency, and we need strict output limits we control); OpenAlex only for DOI lookup (rejected: Crossref is the registration agency for most DOIs and returns the record directly); letting the person edit harvested rows freely (rejected for now: they come from a source and keep their origin); deleting any row (rejected: "not me" must be remembered).
- Evidence: owner message 2026-11-26; `docs/briefs/fp19-publications-intake.md`; SEC-P06 (server-side, allow-listed hosts, timeouts), FF-07 (no external call in a render path: both lookups run from a server action the person presses, never from page render).
- Consequences: Two new hosts in the portal's outbound allow-list (`api.crossref.org`, `api.openalex.org`); the portal deployment must be able to reach them (not testable from this workspace). A signed-in user can trigger up to one lookup per press. The public/private flag is stored but publishes nothing until the bridge exists.
- Cost of reversal: low. Migration 0017 has a down file; the intake actions can be removed without touching the claim queue.
- Reversal trigger: either host blocks or rate-limits the portal; a parser defect reaches production; the owner chooses Odoo as the only source of publication data.
- Owner: the owner (Rizwan).
- Review date: 2026-12-07.
- Prediction: FP19-a to FP19-d in `docs/predictions.md`.
