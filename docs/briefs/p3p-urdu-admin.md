# P3 slice 3p: Urdu for the admin screens (first slice)

**Branch:** `p3/urdu-admin-3p`, stacked on `p3/admin-e2e-ci-3o`. **Objective:** let a member of staff choose Urdu for the admin screens, starting with the part they use on every item (the Ownership and approval panel), without breaking English. **Paths touched (P3 lane only):** `src/i18n/ur.ts` (new), `src/payload.config.ts`, `src/plugins/index.ts`, `src/governance/fields.ts`, `src/app/(payload)/custom.scss`, tests, `.github/workflows/admin-e2e.yml` (one spec added to the list). **No schema change, no migration.**

## What I found first (spike, predictions P3p-a to d)
1. Payload 3.93 has **no Urdu admin language**. It is not in the accepted-language list, the types reject it, and a missing key prints the key itself.
2. It lays out only Arabic, Persian and Hebrew **right to left**, so Urdu needs a stylesheet rule.
3. Plugins (redirects, forms, SEO, search) and the rich-text editor add English words only. Without a fill, an Urdu screen shows raw keys such as `lexical:general:placeholder` and `plugin-redirects:...`.
4. Right to left made the page **10,793 px wide**, because the rich-text editor parks its floating menus 10,000 px left of the page. Invisible left to right, a huge sideways scroll right to left.

## What this slice does
- `ur` is a second admin language, off by default. Each person picks it on their account page. Their content language (English or Urdu) is a separate choice and is unchanged.
- Urdu is built as **English plus Urdu overrides**. Anything not yet translated shows English, never a raw key (`urduFromEnglish` as the last plugin, `completeUrdu` on the finished config).
- Urdu words written: the whole Ownership and approval panel (title, 14 labels, descriptions, every option), 13 of Payload's everyday words (Save, Cancel, Delete, Create new, Publish changes and similar), and the "not allowed" message.
- Labels are written as `{ en, ur }` pairs through `bi()`. The P3k wording guard now judges the English side and fails if a pair has an empty side, and a new test fails if any panel label, description or option lacks Urdu.
- A stylesheet rule flips the layout for `lang="ur"` and clips the sideways overflow.
- Two new browser tests (Urdu: panel in Urdu, right to left, normal width, no raw keys; English unchanged). They run in CI with the other 14.

## Not done, on purpose
- **Every Urdu string is a draft I wrote. None has been read by a native-speaking member of staff.** ADR-0008 says unreviewed Urdu must not pass as final, so the picker names the language "اردو (مسودہ ترجمہ)", meaning "Urdu (draft translation)". Please have someone review before staff are told to use it.
- Still English: about 430 other field labels and 60 descriptions on the content types, menu group and collection names, the dashboard lists, Payload's other ~570 words, and the **error and refusal messages** from the publishing rules (they are thrown from hooks that do not know the person's language, so they need a small change to pass it in).
- One known fault: on the dashboard the breadcrumb sits close to the Locale picker.
- Not a Payload-supported setup. A Payload upgrade can change how languages are accepted; the two new browser tests are the early warning.

## Risks
Low for English (16 browser tests and 534 other tests pass). The added code touches config loading, so a typo would stop the admin starting; it type-checks and builds.

## Gate
Typecheck, lint, 534 tests, production build, 16 browser tests: all run, results in `docs/STATUS.md`. Review of the Urdu wording by a native speaker: **not done**.
