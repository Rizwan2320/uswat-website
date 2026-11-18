# P3 slice 3r: Urdu for field labels, descriptions, options, menu groups and names

**Branch:** `p3/urdu-labels-3r`, stacked on `p3/urdu-admin-3p` (PR #52). **Lane:** `src/i18n`, `src/plugins`, tests and docs. No schema change, no migration, no change to `src/collections`.

## Objective
Slice 3p made the Ownership and approval panel and 13 common Payload words Urdu. This slice translates the rest of what an editor reads on the content screens: field labels, descriptions, select options, tab names, collection and global names, and menu groups.

## How
One reviewable file, `src/i18n/urWords.ts`, maps each English string to its Urdu. A plugin, `urduLabels`, runs near last and wraps each matching string as `{ en, ur }`. English text does not change. The collection files stay untouched, so the main agent's and other lanes' edits cannot conflict with it, and a native speaker reads one file, not 20.

## Left in English on purpose
Payload's own system collections an editor never opens (job queue, locked documents, preferences, migrations, key-value store) and developer-facing task names. Listed in `INTERNAL_ENGLISH` in the same file, with a test that nothing else is missing.

## Risks
A string whose English wording changes later stops matching and falls back to English (never a raw key). A coverage test fails when a label has no Urdu and is not on the internal list, so this is caught in CI.

## Every Urdu string here is a DRAFT
Written by the assistant, not read by a native speaker. The language stays labelled "draft translation" in the picker (ADR-0008, ADR-0013).

## Tests and gate
Unit: the plugin wraps strings and leaves existing `{ en, ur }` alone. Integration: coverage and no stale entries. Browser: the existing Urdu tests plus a check that the Pages screen shows Urdu labels. Gate: typecheck, lint, all tests, build, CI green.

## Three-in, two-out (rule 9)
Adds one plugin and one dictionary. Lets the team remove: 20 separate hand edits across collection files, and the need for a second pass when a collection is added (the coverage test tells you).
