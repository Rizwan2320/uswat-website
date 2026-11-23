# Handoff to the main agent: the portal host's root shows the public landing page

From: FP agent. Date: 2026-11-23. Owner report: opening `https://uswat-faculty-portal.vercel.app` (no path) shows the main website landing page, not the portal.

## Cause
`uswat-faculty-portal` is a second deployment of the same app (ADR-0020), so its `/` is the public home page. Only `/portal/*` is the portal. The landing page's Faculty Portal links are fine (both point to `/portal/sign-in`, checked on the live page 2026-11-23). Anyone who types or shares the bare portal address gets the wrong page.

## Why this is yours
`apps/web/redirects.ts` / `next.config.ts` and Vercel settings are outside the FP lane (CLAUDE.md rule 8, ADR-0027). I changed nothing.

## Suggested change (your call)
On the portal host only, send `/` to `/portal` (307). `/portal` already sends a signed-out person to the sign-in page and a signed-in one to Home.
- In `apps/web/redirects.ts`, add a rule with `source: '/'`, `destination: '/portal'`, `permanent: false`, `has: [{ type: 'host', value: <portal host> }]`. Build the host from `PORTAL_ORIGIN` (set only on the portal project, so the public project is unaffected), or hard-code `uswat-faculty-portal.vercel.app` and add the custom domain when it exists.
- Or a Vercel project redirect on `uswat-faculty-portal` if you prefer settings to code.

## Decide
- Other public paths on the portal host (for example `/about`) still serve the public site. Leave them, or redirect everything outside `/portal`, `/api` and static files.
- Keep the "University website" link in the portal header (`href="/"`): once `/` redirects on the portal host it would loop back to the portal. It should point to the public site's own address (`https://uswat-website.vercel.app`, or the real domain). Tell me the address and I will change it in the portal lane; this is the only part of the fix that is mine.

## Check
Request `/` on the portal host: expect 307 to `/portal`. Request `/` on the public host: expect 200. Not run: I have no shell access to either host.
