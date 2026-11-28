# ADR-0029 Signed portal-to-People bridge, stage 1

- Status: Proposed (owner instruction 2026-11-27; the non-portal parts need the lead)
- Context: Approved profiles and public works exist only in the portal database, so the public `/people/[slug]` page cannot show them. `docs/briefs/fp-faculty-public-pages.md` Part B recommended Option 1 (a signed request that writes People) over Option 2 (public site reads the portal database).
- Decision: Option 1, stage 1: the portal sends a signed request to `POST /api/portal/publish`; the site writes only fields People already has (bio, CV link, email and photo visibility, publications as title and link). People is found by slug equal to the account's `recordRef`. A request-context flag lets the system actor change content on a live People record without resetting Fact-check.
- Three-in, two-out (rule 9): no dependency (Node `crypto`). It lets us remove the second source of truth for the public profile (Option 2's read of the portal database) and the retyping of a publication list on the public page.
- Alternatives: Option 2 (rejected: public site depends on the portal database, two stores); saving a draft revision for a CMS reviewer to publish (rejected for now: the head already approved, a second review would make the page never update in time; reversible by removing the flag); writing SQL directly into the CMS tables (rejected: bypasses audit and hooks).
- Consequences: One shared secret and one site address in both Vercel projects; a new public endpoint that answers 404 unless signed; People gets system writes with the audit entry naming the system actor; `claimedBy` and `faculty` origin remain unbuilt, so the link between account and record is a convention (`recordRef` = slug) until the Registrar's claim is built.
- Cost of reversal: low (remove the route and the flag; the portal sender is behind an env switch).
- Reversal trigger: a forged or replayed request is ever accepted; the lead builds `claimedBy` and wants the lookup moved.
- Owner: the owner (Rizwan). Review date: 2026-12-07.
- Prediction: FP20-a to FP20-d in `docs/predictions.md`.
