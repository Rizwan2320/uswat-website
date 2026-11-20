# Evidence for slice 3u (admin look and feel)

Local run on 2026-11-19, production build, test fixtures only (no real data). Screenshots: sign-in, dashboard, a list and an edit screen, 1440 px and 390 px, light and dark, English; plus the Urdu dashboard at 1440 px. The avatar at the top right is a broken image because the sandbox cannot reach the avatar service; it is the same on plain `main`.

## Accessibility check (axe-core 4.14, run on the 1440 px screens)
"Before" is plain `main` built and run the same way; "after" is this branch. Counts are affected elements.

| language | theme | screen | before: all | before: colour contrast | after: all | after: colour contrast |
|---|---|---|---|---|---|---|
| en | dark | dashboard | 6 | 1 | 5 | 0 |
| en | dark | edit | 32 | 1 | 31 | 0 |
| en | dark | list | 25 | 1 | 24 | 0 |
| en | dark | login | 5 | 0 | 6 | 0 |
| en | light | dashboard | 6 | 1 | 5 | 0 |
| en | light | edit | 40 | 9 | 31 | 0 |
| en | light | list | 28 | 4 | 24 | 0 |
| en | light | login | 5 | 0 | 6 | 0 |
| ur | dark | dashboard | 5 | 0 | 5 | 0 |
| ur | dark | edit | 31 | 0 | 31 | 0 |
| ur | dark | list | 25 | 0 | 25 | 0 |
| ur | dark | login | 5 | 0 | 6 | 0 |
| ur | light | dashboard | 5 | 0 | 5 | 0 |
| ur | light | edit | 34 | 3 | 31 | 0 |
| ur | light | list | 26 | 1 | 25 | 0 |
| ur | light | login | 5 | 0 | 6 | 0 |

Reading it: colour-contrast findings go to 0 everywhere. The other findings are Payload's own markup (unlabelled controls, missing landmarks, heading order) and are the same elements before and after. The one increase is `region` (moderate) on the sign-in screen, 4 elements instead of 3: the crest and name block sits outside a landmark, as does everything else on Payload's sign-in page (it has no main landmark). Not fixed here; Payload's layout would have to change.

## Font weight on first load (English, 1440 px): about 75 to 115 KB. Urdu: about 700 to 740 KB, because the Nastaliq face is large; it loads only when Urdu is on.

axe-core was loaded from the package store (it is already in the lockfile through another package); it is not a dependency of this project and nothing was added.
