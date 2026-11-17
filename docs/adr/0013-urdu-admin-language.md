# ADR 0013: Urdu admin screens are added by hand, as English plus overrides, and labelled a draft

Status: proposed (slice 3p). Date: 2026-11-13.

## Context
Staff may prefer Urdu for the admin. Payload 3.93 has no Urdu admin language: its accepted-language list, its right-to-left list (Arabic, Persian, Hebrew) and its date library mapping do not include Urdu, and a missing translation prints the key. Content in Urdu already works separately (ADR-0008, the content locale). ADR-0008 also says unreviewed Urdu must not pass as final.

## Decision
1. Add `ur` as a second admin language by passing it to `i18n.supportedLanguages` with a type cast, built as Payload's English plus Urdu overrides, so untranslated screens show English.
2. Fill English into Urdu for everything plugins and the editor add after the config is written (`urduFromEnglish`, `completeUrdu`).
3. Flip the layout with one stylesheet rule on `html[lang="ur"]` and clip the editor's off-screen menus.
4. Write labels as `{ en, ur }` pairs (`bi()`), with guard tests so a pair cannot lose a side.
5. Name the language "Urdu (draft translation)" in the picker until a native speaker has reviewed the strings.

## Consequences
- No new dependency (English comes from `payload/i18n/en`). Three things in, nothing removed: this is a feature, justified here for rule 9.
- It is not a supported Payload setup. A Payload upgrade may change language handling. Two browser tests guard it.
- The error messages from publishing rules stay English until the policy messages can take a language.
- Translating the rest is mechanical but large (about 430 labels, 60 descriptions, Payload's own words) and each batch needs review.

## Alternatives rejected
- Using Payload's Persian (`fa`) slot for Urdu text: it is the wrong language in the picker and the wrong date and number conventions.
- Translating everything now: a large block of unreviewed text.
- Patching Payload in `node_modules`: a maintained fork for one language.
