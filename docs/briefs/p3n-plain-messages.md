# P3 slice 3n: refusal messages in editor words

**Branch:** `p3/messages-3n`, stacked on `p3/role-browser-3m`. **No migration**, no change to any error code or HTTP status.

## What changed
The sentences an editor sees when the system refuses something now use the words on the screen: Stage names (Draft, In review, Approved, Published, Archived), Fact-check, Owner office, "Source of the facts", "Check again by", "Take down on", "How sensitive is it?", High impact, "Keep in current lists", Permission to use, and "Publish changes" (the old text told people to use "Save draft", a button that does not exist on autosave pages). Previously they said things like `in_review`, `expireAt`, "risk class" and "verification status". Files: `policy.ts`, `mediaRules.ts`, `mediaGuard.ts`. The editor guide's message table is rewritten to match.

## Guard
`tests/unit/messages.unit.spec.ts` scans the sentences in the policy, media, accessibility and hook modules for code names. On the old messages it found 8; now 0 (prediction P3n-b).

## Tests
Typecheck, lint (0 errors), 393 tests on a freshly migrated empty database pass. Browser tests not re-run (no UI change).

## Not run / open
- Real editors reading the sentences (CMS-15).
- Urdu translations of messages (English only).
- Field validation messages from Payload itself ("This field is required") are Payload's own wording and were left alone.
