# Predictions log

Predict before you run. Then record the actual result, the difference and why.

| ID | Phase | Prediction (written before running) | Actual | Difference and why |
| --- | --- | --- | --- | --- |
| P0-a | P0 | Scheduled publish on Vercel Hobby needs an outside trigger because platform cron on free plans is likely limited; plan: a GitHub Actions job calls a secured jobs endpoint every 5 minutes. | Half tested. The jobs endpoint accepts a bearer secret (200 / 401 / 401) and a queued publish ran correctly when the endpoint was called after its due time, so an external trigger works. Vercel Hobby cron limits were not tested. | Mechanism proven; the platform limit is still unverified. |
| P0-b | P0 | Payload localization works for rich text but needs extra work for Urdu right-to-left editing in the admin. | Partly tested. Text fields localize correctly once marked `localized: true`; rich text and admin editing in right-to-left were not tested. Unpredicted: adding localization after data exists stalls on an interactive schema prompt. | Prediction missed the real risk: ordering. Decide locales and localized fields first. |
| P0-c | P0 | TypeScript 7 will build the template with small changes. | Failed: `baseUrl` removed, plus generic type errors. | Optimistic; stay on 5.7.x. |
| P1-a | P1 | First database query after 5 idle minutes on Neon takes 0.5 to 3 seconds. | not yet run | |
| P1-b | P1 | No blocker appears when moving from the template to our own app structure; the first fix will be Next `agentRules` overwriting CLAUDE.md. | not yet run | |
