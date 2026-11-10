# G2 evidence: template routes on the site shell (branch p2/templates, 2026-11-09)

ADR-0011, brief `docs/briefs/P2-milestone-C-routes-on-shell.md`, prediction P2-b. Run locally on a production build with a throwaway Postgres that held clearly labelled test content ("LOCAL TEST", 1 page, 14 posts). Not run against the Vercel preview. The demo database still has no pages or posts.

| Check | Result |
| --- | --- |
| `tsc --noEmit`, `pnpm lint` | clean, 0 errors (14 warnings, same kind as before) |
| `pnpm test:unit` | 94 passed |
| `pnpm test:int` (includes the P3 governance tests) | 137 passed |
| `tests/e2e/kit.e2e.spec.ts` + new `tests/e2e/shell.e2e.spec.ts` (site header, footer, one h1, breadcrumb, Inter body font, no Geist request, no sideways scroll at 360px on `/posts`, `/search`, `/this-page-does-not-exist`, `/a/b/c`) | 12 passed |
| axe (wcag2a, aa, 21aa, 22aa, best-practice) on `/posts`, `/posts/page/2`, a post, a page, `/search?q=test`, 404 at 1440, 768, 390 LTR and 1440 RTL | 24 checks, 0 violations after two fixes |
| Horizontal overflow on the same 24 checks | none |
| Geist in the lockfile, in requests | 0, 0 |
| `/admin`, `/api/users`, `/healthz`, `/readyz`, `/sitemap.xml` after the move | 200, 403 (no session), 200, 200, 200 |

Screenshots: `docs/evidence/G2/shell/`.

## Not run
- Vercel preview of this branch (pushed, not yet opened).
- Real content: nothing from the CMS beyond throwaway test records; block-by-block look of Archive, Form, Media and Banner blocks is not checked.
- Native Urdu review; RTL was checked only by flipping `dir` and `lang`.
- Keyboard-only pass of the header drawer.
- Screenshot baselines (still to add).

## Known limits
- Public pages no longer show Payload's admin bar to signed-in staff.
- The CMS-managed Header and Footer globals still exist in the config but the public shell uses the static site navigation; wiring them is a P3/P4 decision.
- A page whose hero is "High impact" supplies its own headline; editor guidance must say the hero text carries the h1 (to be added to the editor guide).
