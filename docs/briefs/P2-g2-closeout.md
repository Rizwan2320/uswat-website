# Brief: P2 close-out for gate G2 (branch p2/g2-closeout)

- **Objective:** finish what the plan still lists for P2: the Urdu/right-to-left pass, screenshot baselines at three widths in both directions, the keyboard test for the drawer, and a guard against stray colours; then the paperwork (ADR-0008, ADR-0011 accepted, tokens location noted).
- **Paths touched:** `apps/web/src/design/site.css`, `site/components/{Footer,LeadershipDialog,kit/Prose,kit/Accordion}`, `app/(site)/design/design.module.css`, `apps/web/tests/{e2e,unit}`, `playwright.config.ts`, `package.json` (script only), `docs/`.
- **Risks:** a global bidi rule changes alignment sitewide (check LTR did not move: baselines taken after, compared by eye against the earlier LTR renders); baselines depend on machine fonts; the colour guard could block legitimate work (it lists exceptions and says what to do instead).
- **Tests:** drawer keyboard e2e (both directions), visual baselines (re-run twice), colour guard (negative-tested), `test:int`, typecheck, lint, kit and shell e2e.
- **Prediction:** P2-c.
- **Gate:** G2. Remaining after this branch: owner sign-off on the shell screenshots; native Urdu review; baselines regenerated in the checking environment.
