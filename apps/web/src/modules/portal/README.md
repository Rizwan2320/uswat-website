# Faculty portal module

Pages and actions for the faculty portal (Addendum C). Each folder (profile, publications, courses, review, activation, delegation, notifications, cv, claim) holds a seam: types, rules, a pg store, a service, `'use server'` actions and the view. The account id always comes from the session, never from a form. All shipped data is Sample.

A private hosted copy for the owner is described in `docs/briefs/portal-demo-hosting.md`.

One-time exception (owner approved 2026-11-22): the demo's first build ran the CMS table setup against the demo database only, then the build command went back to plain `pnpm build`.
