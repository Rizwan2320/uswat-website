# Go-live checklist for the lead

Written 2026-11-23 by agent 4 (lanes P4, P5), branch `p4/real-departments`, PR #116. Agent 4 does not merge, deploy or touch DNS, the live university site or Odoo (CLAUDE.md rules 5 and 8); this is a list for the lead to work through. Each item says whether it was run and where the fact comes from.

## 1. Before merging

- [ ] CI is green on each PR. Open PRs known to agent 4: #94, #96, #97, #98, #101, #107, #116. Merge order is the lead's call. #116 edits `Academics.module.css`, `blocks.tsx` and the office template, so check for conflicts with any other PR touching those files.
- [ ] A production build passes (`pnpm build`). Agent 4 did not run it locally; Vercel's own build of `f89a0047` finished READY (see section 4).
- [ ] End-to-end tests and the pack-integrity check in #94 pass. **Not run by agent 4.**
- [ ] Unit tests: 904 pass and `tsc` is clean on `p4/real-departments` at the time of writing (run 2026-11-23). ESLint shows one old warning in `tests/unit/identity/gate.unit.spec.ts`, not from this branch.

## 2. Old addresses (redirects)

Source: `docs/adr/0012-old-addresses-answered-in-the-proxy.md`, `scripts/import/data/route_map.csv`, `src/proxy.ts`.

- Old addresses are answered by the proxy from the route map (1,613 rows: 1,542 go to a new path with a 301, 5 are dead links answering 410, 66 keep the same address). After editing the CSV run `pnpm routemap:build`; a test fails if it is forgotten.
- [ ] Owner confirmation of the 33 held-page 301 targets (`/` and `/academics/`), listed in `docs/STATUS.md` as waiting for the owner.
- Checked on a local dev server on 2026-11-23: `/central-library-office/`, `/department-of-management-commerce/` and `/qec/` each answer 301 to the address in the map.
- **Pages built in PR #116 against the map**
  - `/academic-calendar`, `/administration/central-library-office`, `/administration/quality-enhancement-cell`, `/academics/departments/management-commerce`, `/academics/departments/english-and-foreign-languages` match the map's targets. Their old addresses reach a real page.
  - **Fixed 2026-11-25 (agent 4, redirect route files; see the round 2 line below).** Earlier finding, kept for the record: **two mapped targets had no page and answered 404** (checked locally): `/qec/` goes to `/administration/qec`, and `/digital-library/` goes to `/administration/digital-library`. So an old link to either ends on a 404 after one 301. Options for the lead: change the two map rows (`/qec/` to `/administration/quality-enhancement-cell/`; `/digital-library/` to the external Digital Library the menu already uses, or to `/administration/`) and run `pnpm routemap:build`, or create pages at those addresses. Agent 4 did not edit the map: it is generated and routes are owned by the lead.
- Four more department pages (added after the first version of this list): `/academics/departments/geology`, `/archaeology`, `/environmental-sciences` and `/economics-and-development-studies`. Their old addresses (`/department_of_geology/` with underscores for Geology; `/department-of-archaeology/`, `/department-of-environmental-sciences/` and `/department-of-economics-and-development-studies/` for the others) are in the route map with these targets and answer 301 locally. They are in the sitemap but **not in the header menu**; the departments list page is read from the CMS, so they show there only if the CMS has a department record with the same slug (the static page then wins over the CMS page of that slug).
- Affiliated Colleges and the admissions links still point at the old site from the menu (see section 5). The footer's Library link now goes to the new library page.

## 3. Sitemap

- `content-sitemap.xml` lists the five new pages (checked locally on 2026-11-23, 82 entries in total) through `LIST_PAGES` in `src/site/sitemap/entries.ts`. It refreshes every 300 seconds.
- [ ] On the preview or production, open `/content-sitemap.xml` and `/pages-sitemap.xml` and confirm the addresses use the real domain, not `localhost` or a `*.vercel.app` host (the base comes from `getServerSideURL()`).
- [ ] Submit the sitemap index in Search Console after cutover (the lead or the university's web team; agent 4 has no access).

## 4. Preview check (open each on the preview, desktop and phone)

Pages and what to look for:

| Address | Look for |
|---|---|
| `/about`, `/about/vice-chancellors-message`, `/research`, `/administration` | Photographs rotate on the right of the banner every 7 s, fade into the banner on their left; no green strip under the menu |
| `/administration/directorate-of-it`, `/administration/central-library-office`, `/administration/quality-enhancement-cell`, `/academic-calendar` | Same banner; hero card with gold label; "Still to be confirmed" list at the end |
| `/academics/departments/dcst` and one programme page | DCST coding photographs on the banner, campus photograph on the hero card |
| `/academics/departments/management-commerce`, `/academics/departments/english-and-foreign-languages`, and the four above (geology, archaeology, environmental-sciences, economics-and-development-studies) | Programme lists, people, vision and mission, "Still to be confirmed" list |
| `/faculties/allied-health-sciences` and its four programme pages (`/academics/programmes/bs-medical-laboratory-technology`, `bs-dental-technology`, `doctor-of-physical-therapy`, `bs-radiography-and-imaging-technology`) | Same bands as the DCST pages; draft line at the foot; the faculty page ends with Contact and Sources. The four programme pages need their seeded CMS records, as before |

- [ ] The preview URL opens without a Vercel login (Deployment Protection) when judges or the public need it. A preview build can sit queued for several minutes; it finished by itself earlier.
- [ ] Phone width (about 390 px): plain banner without photographs, no sideways scrolling.
- [ ] Menu: Management & Commerce, English and Foreign Languages, Academic Calendar, Central Library and QEC open the new pages and not the old site.
- Vercel preview of commit `f89a0047` (branch `p4/real-departments`), checked 2026-11-23 by fetching pages with the team's own access: the build is READY; `/administration/central-library-office`, `/academics/departments/management-commerce`, `/academic-calendar` and `/about` return their own title, one `<h1>`, the seven banner photographs and the "Still to be confirmed" list (the last on all four); `/administration/qec` returns 404, as predicted in section 2. The page text was checked, not how it looks; the screenshots in this list are from the local copy. Not checked on the preview: phone width, rotation timing.
- Local checks run 2026-11-23: axe (WCAG 2 A/AA) shows no violation, no horizontal overflow and no broken image on 10 sample pages at 1440, 1024 and 390 px. 

## 5. Known gaps to tell the owner

- Affiliated Colleges: not built. The saved copy of the old page is an empty stub (65 bytes), so there is no college list. A real source is needed.
- Admissions links: not built. Digital Library stays an external menu entry.
- The QEC and Academic Calendar pages name their documents but do not link the PDFs, because those links exist only on the live site, which agent 4 does not fetch.
- Photographs on pages other than DCST are the seven the landing page already uses (supplied by the owner on 2026-11-08, see `src/site/content/images.ts`; people are visible in them).
- Allied Health Sciences and its four programmes follow the DCST layout with illustrative text (laboratories, research, careers, study plans); only the facts listed under Sources on the faculty page come from the university's pages. No eligibility, fee or seat count is shown.
- Research and Administration round 2 (2026-11-25, `docs/STATUS.md` has the list): 16 more office-style pages built from the old pages' own text (`/research-group` and 15 under `/administration/`). Each shows its source and date; contacts are office mailboxes only. An office with a profile now renders without a CMS record; the 15 seed rows are only for editing in the CMS. Of the nine old pages that are empty on the university's site, three are built (Sports, Office 365, Deans) and six are 308 redirects in route files (dean offices to the Deans page, `qec` to the Quality Enhancement Cell, the DASR duplicate to DASR, `digital-library` to the national digital library). That fixes the two broken map targets above (`/qec/`, `/digital-library/`); changing the map rows instead is also fine, then delete those six route files.
- Campus Life and Admissions (2026-11-26, `docs/STATUS.md`): nine more office-style pages (`/campuses/main`, `/campuses/women`, `/campuses/sangota`, `/red-crescent-building`, `/convocation-2022`, `/open-day`, `/admissions`, `/admissions/merit-lists`, `/downloads`). Route map follow-up for the lead: eight blank old pages (admission-rules, online-admissions, fee-structure, societies, activities, facilities, gallery, online-psychology-clinic) currently redirect to `/`; `/admissions` (first three) and `/campuses/main` (rest) would be nearer targets.
- All institutional data is dummy or taken from saved copies dated 2026-11-06; every page lists its source and `verifiedAt`.

## 6. Owner and lead items already recorded in STATUS.md (not done by agent 4)

Seeding labelled Sample content into the production database needs a separate explicit step; `PORTAL_*` variables only when the faculty portal is meant to go live (it is off and returns 404 now); turn Deployment Protection off before judges; rotate the Neon password; Urdu words need a native reader. DNS and the domain switch are the lead's and the university's.

## 7. After cutover

- [ ] Request 10 old addresses from the route map (a mix of pages, news and jobs) and confirm 301 to a page that returns 200.
- [ ] Open the five new pages on the real domain.
- [ ] Rollback: Vercel can promote the previous production deployment; decide who does it before the switch.
