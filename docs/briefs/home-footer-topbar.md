# Brief: the top bar and the footer from the CMS (landing page, step 5)

**Branch:** `feat/home-footer-topbar`. **Owner request 2026-11-28:** "go footer and top bar".

## Objective
Admin, Globals, Home page content gains two groups:
- **Top bar:** place, the line beside it (Established in 2010), the Student Portal link and the Faculty Portal link.
- **Footer:** the line under the university name, address, telephone (the dialling link is worked out from it), whose telephone it is, email, the Facebook, YouTube, LinkedIn and TikTok links, the map link, and the Quick Links and Useful Links lists (up to 8 each).
A field left empty keeps the standard text or link, as for the other parts.

## Where it shows
Both are part of the shared page layout, so a change shows on every page, not only on the home page. They sit in this global because the publish rules, revalidation and tests are already here; a separate "Site settings" global was not worth a second copy of that machinery (three-in, two-out: nothing added, nothing duplicated). The field descriptions say "every page".

## Paths
- CMS lane (one migration, `20261128_100553_home_footer_topbar`, additive and reversible: 14 columns on each of the main and versions tables and four link tables): `globals/HomeContent/index.ts`, `governance/homeContent.ts` (`phoneValidate`, `FOOTER_LINKS`), `i18n/urWords.ts`.
- Main lane: `site/home/homeMap.ts` (`toTopBar`, `toFooter`, `telHref`), `site/lib/content.ts` (`getTopBar`, `getFooter`), `components/TopBar.tsx` (now async), `components/Footer.tsx`.

## Rules
- Only the published version reaches visitors; drafts never do.
- Every link is checked twice: the admin refuses a bad one at publish (a page on this site, https or http), and the page ignores any link that is not safe to put in an `href` (`isSafeHref`), keeping the standard link. An email that does not look like one is ignored.
- An address typed in the admin is the university's own, so it no longer carries the Sample tag. The standard address keeps its Sample tag (the Odigram/Charbagh conflict is still open).
- A telephone starting 0 becomes +92 with the zero dropped; one starting + or 00 keeps its country code; one that cannot be read keeps the standard dialling link.
- A link list with no complete row keeps the standard list. The header and its menus are not in this step (next: navigation). The Privacy and Terms words in the footer's bottom line, and the copyright line, are unchanged.
- Stored once, not per language; link texts are not translated.
- The contact page and other pages that read `site.phone`, `site.email` and `site.address` from the file are not changed here.

## Tests and gate
Unit: top bar, footer, telephone. Integration: the getters return the published values and never the draft, clearing returns the standard ones, and publishing refuses a `javascript:` link in either list, a social link that is not a page or https, a telephone with letters and a `data:` top bar link. Urdu coverage for the 31 new labels and descriptions. Typecheck, lint, integration tests, build, 12 visual checks (the default look must be unchanged on every page).
