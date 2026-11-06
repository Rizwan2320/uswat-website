# ADR-0001 TypeScript, Next.js, Payload 3, PostgreSQL

- Status: Accepted 2026-11-06 (conditional on the usability test in P3)
- Context: Plan v2 section 1. Stack is free (user decision); target is a CMS-driven university site that can be migrated into the university.
- Decision: TypeScript (5.7.x baseline), Next.js 16 App Router, Payload 3.93.0 embedded, PostgreSQL, Tailwind 4.
- Alternatives considered: WordPress, Drupal, Strapi, Directus, Sanity, Contentful (plan section 1).
- Evidence: spike S-1, `docs/evidence/G0/spike-report.md`: items 1 to 5, 7, 10 to 12 pass.
- Consequences: Pin 3.93.0; do not follow `main` (Payload 4 beta). Localization decided before data. Jobs run through the HTTP endpoint.
- Cost of reversal: High after P3; low before.
- Reversal trigger: usability test fails twice, or Payload stops supporting the Next.js version in use.
- Owner: user (accepts), Claude (maintains).
- Review date: end of P3.
- Prediction: no blocker appears in P1 (recorded as P1-b).
