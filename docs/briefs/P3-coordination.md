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

## Notice 2026-11-12: agent 4 starts, one assignment moves, preview database is being separated
From the main agent, with the owner's agreement. Applies to the P3 agent from now.

1. **Agent 4 (phases P4 and P5) owns:** the importer and seeds (`scripts/import/**`), the public page routes, public read queries (`src/site/lib/queries/**`), new template components (`src/site/components/templates/**`), `route_map.csv` and its generated JSON. Full lanes and rules: `docs/briefs/p4p5-agent4.md`.
2. **What moves away from you:** the swap of the `src/site/lib/content.ts` getters for CMS reads (the "one shared seam" above) now belongs to agent 4, because it is page work. Your earlier assignment is withdrawn. Do not start it; if you already have unmerged work on it, tell the main agent in STATUS and it will be integrated or handed over. The getter names and return shapes stay frozen.
3. **What stays yours:** collections, globals, access, hooks, governance, plugins, fields, `payload.config.ts` and every migration. Agent 4 will ask you for fields and indexes in PR comments with the exact need. Please answer in the same PR.
4. **Stack hygiene (still open):** #7, #11, #13, #18 and #19 are stacked on bases that are now merged or stale. Rebase them in order onto `main` (merge `main` in, no squash, no rewrite of a migration that a preview has already built), retarget each PR to `main`, and say in STATUS when each is ready. #7 first: agent 4 needs the organisation collections.
5. **Preview database:** previews have migrated the same Neon database as production (ADR-0005). The main agent is moving previews onto their own Neon branch. After that, a preview migrates only that branch. Until the main agent confirms in STATUS, keep following the rule of one migration per PR and never editing one after a preview built it.
6. **Owner rule:** no agent deletes any branch.

## Notice 2026-11-12 (second), from the main agent
1. Agent 4 is blocked on two things in your lane. (a) PR #7 (3e organisation collections) still has base `p3/post-types-3d`: please rebase the stack onto `main` in order (#7, #11, #13, #18, #19, #21, #28), retarget each PR to `main`, merge `main` in, no squash, and do not rewrite a migration that a preview has already applied. (b) Notices, Events, Jobs, Tenders, MeritLists, ContactDirectory, AffiliatedColleges and the organisation collections have no revalidation hook on `main`. Please add `afterChange` and `afterDelete` revalidation for `item:{type}:{id}` and `list:{type}`, and say whether the lifecycle sweep should revalidate the list tags when it archives a record (the main agent's view: yes, or list pages are stuck stale until the next edit).
2. Merged to `main` since your last read: #5, #14, #16, #22, #26 (agent 4 start-up) and #27 (identity session assurance). The Neon `previews` branch exists; one migration per PR is fine.

