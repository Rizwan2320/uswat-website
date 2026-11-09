# Brief: working in parallel, P3 CMS core and the P2 template kit

Date: 2026-11-09. Written by the main agent (P2 owner and PR reviewer). Applies to the agent implementing P3 (plan v2 section 11, addendum edits in section 17).

## Who does what
- **Main agent:** P2 milestone C (inner-page template kit, Geist removal, RTL pass, `/design`, snapshot baselines, G2 evidence) and review and merge of every PR.
- **P3 agent:** CMS core as in plan section 11, P3. Collections and globals, roles and access, editorial states, drafts and preview, scheduled publish, audit log, media rules, accessibility validators, SEO and redirects, form builder, editor dashboard.

## Lanes (rule 8: schema, tokens and routes are never edited by two agents at once)
| Area | Owner | Notes |
| --- | --- | --- |
| `src/collections/**`, `src/globals/**`, `src/access/**`, `src/hooks/**`, `src/plugins/**`, `src/endpoints/**`, `src/fields/**`, `payload.config.ts` | P3 agent | Main agent does not edit these. If a template needs a field, open an issue or a PR comment and the P3 agent adds it. |
| `src/migrations/**` | P3 agent | One migration per PR, never edited after merge. Main agent rebases, never rewrites. |
| `src/design/**` (tokens, `site.css`), `src/site/components/**`, `src/app/(site)/**`, `src/app/(frontend)/**` page templates | Main agent | P3 agent does not edit these. Admin-panel branding is the exception and is agreed in the PR. |
| `src/site/content/**` (typed files) and `src/site/lib/content.ts` | Shared, via the seam below | |
| `docs/STATUS.md`, `docs/predictions.md` | Both, append-only, own section per agent | Resolve conflicts by keeping both entries. |

## The one shared seam
`src/site/lib/content.ts` exposes async getters (`getSite`, `getNav`, `getHero`, `getStats`, `getLeadership`, `getAdmissions`, `getPortals`, `getFeeds`, `getNews`, `getEvents`). Components call only these. The P3 agent replaces what is behind each getter with Payload local-API reads, in small PRs, **keeping every function name and return shape unchanged** (types are in `src/site/content/types.ts`). If a shape must change, change the type in the same PR and tell the main agent first. Until a getter is switched, the typed file stays the source.

Never read the CMS from a component. Never import from `content/*.ts` outside `lib/content.ts`.

## Rules that bite in this repo
1. CLAUDE.md operating rules apply (brief first, predictions before drills, no invented facts, no secrets or personal data, Conventional Commits, "not run" instead of an unrun claim).
2. Real data only where it has a source URL and `verifiedAt`; otherwise labelled Sample. The owner states DCST allows real data and images, but no written confirmation is filed yet: do not remove Sample labels on the strength of that statement alone; the owner supplies each value.
3. Crawl data and staff contact details stay out of the public repo (STATUS "Inputs received").
4. Vercel is demo-only. Merging to `main` redeploys the demo at https://uswat-website.vercel.app, so `main` must always build.
5. Never touch the live university site, Odoo, DNS or real applicant data.

## Branches and PRs
- Branch names: `p3/<topic>` for the P3 agent, `p2/<topic>` or `docs/<topic>` for the main agent. Branch from current `main`.
- Keep PRs small, one concern each. Rebase on `main` before asking for review (no squash merges of long-lived branches; merge commits or fast-forward only, so later merges stay conflict-free).
- Only the main agent merges.

## PR checklist (the main agent will check each item)
- [ ] CI green: typecheck, lint, `db:migrate`, `test:int`, build.
- [ ] Brief at the top of the PR: objective, paths touched, risks, tests, gate.
- [ ] Predictions written in `docs/predictions.md` before any drill, benchmark or migration, with actual result and difference after.
- [ ] Touches only its own lane, or says why and who agreed.
- [ ] One migration at most, applied cleanly on an empty database and on the current schema; rollback or restore noted.
- [ ] No secrets, personal data or private payloads; no crawl data committed.
- [ ] Getter signatures unchanged (or the type change is explicit and agreed).
- [ ] Tests for what the PR claims (role matrix, schedule, audit as in G3); anything not run says "not run" and why.
- [ ] STATUS.md entry for the PR in the agent's own section.

## Hand-offs the main agent will provide
- Inner-page template kit (breadcrumbs, page header, list with pagination, article, accordion, tabs) so P3 can point rich-text and block renderers at it. Until then, P3 renderers keep the stock components.
- `docs/design-notes.md`: the visual rules every new component follows.

## Open items needing the owner (do not guess)
Written DCST confirmation; the organized data pack; where crawl data may live; Neon password rotation; real address, deadline and statistics values.
