# Brief: public faculty pages and the portal-to-site bridge

Date 2026-11-24. From the FP agent (faculty portal) to the lead and the main agent. Requested by the owner: a public page that lists faculty and one public profile page per person, showing what the person wrote in the faculty portal and had approved. Public pages, People collection, routes and Vercel settings are the main agent's lane; the portal side of the bridge is the FP lane. Nothing here is built yet.

## What the owner wants (as clarified)
1. The "Faculty portal" card on the public home goes straight to the portal sign-in. Already true (`site.ts` points at `/portal/sign-in`). Open item: the bare portal address still shows the public home (see `fp-handoff-portal-root-redirect.md`).
2. A public list of faculty, and a public profile page for each person, built from the profile the person wrote in the portal after it was approved (or self-published by a head or the Registrar).

## Part A: public pages (main agent)
- `/faculty`: all published faculty, grouped by department, searchable by name; designation and photo only if the person made the photo public. `/faculty/[slug]`: the profile (name, designation, department, bio in English and Urdu, research interests, office and hours, ORCID iD and Google Scholar link as links, CV link, claimed publications, email only if public).
- Read from the People collection (already has name, designation, department, details, email, photo, cvLink, publications, facultyStatus and `visibility`). Respect `visibleWhenPublic` for email and photo. List only people with a published record and `facultyStatus` current. Draft or unpublished records are never listed.
- Works today on the 10 Sample People records, before Part B exists. Route addresses are proposed (`/faculty`, `/faculty/[slug]`); the route map decides.
- Needs the usual page rules: Urdu and English, plain-text rendering of free text, no private fields, canonical URL, sitemap entry.

## Part B: bridge (decision needed)
Today the portal's publisher writes a stand-in row (`identity.profile_published`). Two ways to make the real thing:

| | Option 1 (recommended): content service writes People | Option 2 (interim, faster): public site reads the portal's published table |
|---|---|---|
| How | Portal sends a signed request to an endpoint on the public site; the endpoint upserts the People record with origin `faculty` and revalidates the page | Public site reads `identity.profile_published` through a read-only database role and merges it with People |
| Source of truth | People (the CMS), as the field map and ADR design agreed | Two stores |
| Needs | Additive People migration (fields below) and `claimedBy` and `faculty` origin; migration on live CMS Neon applied by the lead; one shared signing secret in both deployments | A second database URL (read-only) in the public site's Vercel settings; no CMS migration |
| Risk | Larger change on the CMS side | Public site depends on the portal database; the portal's emails must never be exposed (select approved fields only) |

Recommendation: Option 1, because it follows `docs/briefs/fp11-people-field-map.md` and keeps one source of truth. If the lead cannot take the migration before 1 December, ship Option 2 for the demo and keep Option 1 as the target.

### Option 1 contract (proposed)
- Endpoint on the public site: `POST /api/portal/publish`, accepts only a request signed with HMAC (shared secret, timestamp within 5 minutes, body hash), rejects anything else with 404.
- Body: `{ subject: <opaque portal id>, edit: { bio{en,ur}, researchInterests[], officeLocation, officeHours, orcid, scholarUrl, cvLink, visibility{email,photo} }, approvedAt, approvedByRole: 'reviewer'|'self' }`. Allow-list only; name, designation, department and status are never accepted from the portal (the Registrar's data reaches People by its own path).
- The endpoint finds the People record by `claimedBy` (set when the Registrar links the account to the record) and refuses if none. It writes with origin `faculty`, records the actor in the audit log, and revalidates `/faculty` and `/faculty/[slug]`.
- Portal side (FP): a real `Publisher` that signs and sends the request inside the approval transaction's after-commit step, retries safely (idempotent on `approvedAt`), and shows "waiting to appear on the public site" when the call fails. Replaces `samplePublisher`; screens do not change.

### People fields needed (additive)
`researchInterests` (array of text), `officeLocation` (text), `officeHours` (text), `orcid` (text, checksum validated), `scholarUrl` (text, https and scholar.google.com), `claimedBy` (opaque text, system only), `faculty` as an origin value. Phone is not needed for now.

## Order of work and the gate
1. Main agent: Part A on Sample People; checks as for any public page.
2. Lead: decide Option 1 or 2 by the end of this week; if Option 1, review and apply the People migration.
3. FP: real publisher and tests (signature, replay, allow-list, idempotency, failure message); end-to-end run on a preview: approve a Sample profile, see it on `/faculty/[slug]`.
4. Not run yet: everything above.

## Limits to state on screen and in the presentation
Sample data only; email and photo follow the person's visibility choice; a change appears on the public site only after approval (or self-publish by a head or the Registrar); the page can lag by the cache time.
