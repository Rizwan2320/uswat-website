# Predictions log

Predict before you run. Then record the actual result, the difference and why.

| ID | Phase | Prediction (written before running) | Actual | Difference and why |
| --- | --- | --- | --- | --- |
| P0-a | P0 | Scheduled publish on Vercel Hobby needs an outside trigger because platform cron on free plans is likely limited; plan: a GitHub Actions job calls a secured jobs endpoint every 5 minutes. | not yet run | |
| P0-b | P0 | Payload localization works for rich text but needs extra work for Urdu right-to-left editing in the admin. | not yet run | |
| P1-a | P1 | First database query after 5 idle minutes on Neon takes 0.5 to 3 seconds. | not yet run | |
