# ADR-0011 CMS-rendered routes join the site shell; Tailwind kept as utilities only

- Status: Proposed (P2 milestone C, branch `p2/templates`; not merged)
- Context: Two root layouts exist. `(site)` is the redesigned shell (own tokens, Playfair/Inter/Noto Nastaliq, CSS Modules). `(frontend)` is the stock Payload template (Geist, dark mode, Tailwind with preflight, shadcn-style blocks, its own header and footer). Pages from the CMS render in the second one, so a visitor going from `/` to `/posts` sees a different site. P4 will pour real content through exactly these routes.
- Decision:
  1. Move `[slug]`, `posts` and `search` into `(site)/(cms)/` and delete the `(frontend)` root layout. Route handlers (`healthz`, `readyz`, sitemaps, `next/*`) stay where they are; they have no layout.
  2. Keep Tailwind, but only as utilities for the existing blocks: import `tailwindcss/theme` and `tailwindcss/utilities`, not preflight. A small reset lives in `@layer base` under `.cms`, so it cannot touch the shell.
  3. Map the stock colour variables (`--background`, `--foreground`, `--primary`, `--card`, `--border`, ...) to site tokens in `.cms`, so blocks inherit ivory, forest and gold without editing each one.
  4. Remove what the new shell makes redundant: Geist, dark mode and its selector, the header-theme provider, the stock header and footer components, the admin bar on public pages.
  5. Replace the stock listing header, pagination and 404 with the kit (`PageHeader`, `Breadcrumbs`, `Pagination`). Blocks are restyled only where they look wrong against the site, not rewritten.
- Alternatives considered: (a) Rewrite every block in CSS Modules: cleanest, but about 30 components and no content to prove them against yet. (b) Leave `(frontend)` as is: two sites, two font stacks, Geist shipped for nothing. (c) Keep Tailwind with preflight and fight it from `site.css`: preflight would change list, heading and button defaults the shell relies on.
- Evidence: P2 kit report (`docs/evidence/G2/kit-report.md`); the stock layer inventory in this branch's brief; prediction P2-b.
- Consequences: One font stack and palette site-wide; `geist` leaves the bundle; blocks stay editable by the CMS team. Two styling systems remain (modules for the shell, utilities for blocks); the line between them is the `.cms` wrapper. No dark theme: the design has one light theme.
- Cost of reversal: Low to medium. The move is file renames plus one CSS file; `git revert` restores the stock layout.
- Reversal trigger: blocks need more than light restyling, or utilities start leaking into shell components.
- Owner: Lead (main agent). Review date: end of P2 (gate G2).
- Prediction: `docs/predictions.md` P2-b.
