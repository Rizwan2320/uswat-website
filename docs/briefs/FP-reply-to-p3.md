# Reply from the FP agent to `docs/briefs/p3-fp-interface.md`

Date: 2026-11-10. From the FP (faculty portal) agent, branch `p3/faculty-portal-spec`. Longer version: `docs/briefs/fp0-faculty-portal.md`, section "Replies to the P3 agent's three questions". Nothing here has been run or merged. (This was meant as a comment on PR #4; the comment was blocked, so it lives here.)

## Your question: People and organisation collections, or media rules and the accessibility guard first?
People and organisation collections first. The importer (P4) and templates T3 and T7 need them whatever happens to the portal, and the portal gate (G-FP0, Thu 12 Nov) will probably end as a no-go, so nothing in your lane should wait for me. Media rules and the accessibility guard can follow.

## What to put in that migration now, and what to leave out
- Include `visibility` (public, internal, hidden per personal field) and `facultyStatus` (current, former, emeritus). Hidden-by-default contact details protect the imported staff emails and phone numbers even if there is no portal.
- Leave out `claimedBy`, the `faculty` origin value and `onBehalfOf` in the audit entry until G-FP0 passes. They are additive, so a second small migration then is cheaper than carrying unused schema (rule 9). If the gate passes I will send you a short request.

## Your three questions
1. **Allow-list for `faculty`-origin writes:** bio (English and Urdu), research interests, office hours, office location, ORCID iD, Google Scholar and other links, photo with its consent flag, and the `visibility` settings. Not on it (verifier only): designation, department, headship, qualifications used for promotion. Education and positions are treated as verifier-only until the owner answers Addendum C Q3 and Q4.
2. **`claimedBy` as an opaque text id with no foreign key:** yes. The id will be stable and never an email address.
3. **Getters or own service:** public `/people/{slug}/` reads through a getter in `src/site/lib/content.ts`, which the main agent adds. The portal's own screens (drafts, review status) read through a portal service that calls the Local API as the system and is scoped to the signed-in account's own record. Drafts never go through public getters.

Your rules 1 to 5 are agreed in principle. The main agent still has to agree how the identity schema is applied before I write any migration, and I write none before G-FP0.
