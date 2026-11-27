# P3 slice 3af: a picture that a record still uses cannot be deleted

**Branch:** `p3/media-delete-guard-3af`, from `main`. **Lane:** `src/governance/mediaGuard.ts`, `src/collections/Media.ts`, tests, docs. No schema change, so no migration.

## Why
Found in slice 3ad: the integrity guard of slice 3s (`findReferences`, "still used by 12 People") is attached only to governed collections. Media is not governed, so any signed-in user can delete a picture that departments, people, posts or pages still show, leaving broken images on live pages.

## Decision
1. A `beforeDelete` hook on Media asks `findReferences(payload, 'media', id)` and refuses with the same 409 `IN_USE` message and counts as for other records. The fields that point at media are found from the config, so new fields (the department and programme pictures in #124 and #127) are covered with no list to keep in step.
2. Who may delete is unchanged (any signed-in user, `delete: authenticated`). This is an integrity check, not a permission change.
3. The system actor is not exempt: a script that deletes a used picture is also refused.

## Known limits
- Only collections are searched. Globals that point at media are not (none on `main`; the home content global of #117 will be). When #117 merges, its pictures need the same check: noted in that PR.
- Only the latest saved state is looked at (as for other records); an old saved version that used the picture does not block the delete.

## Gate
Typecheck, lint, new tests (a used picture is refused with the count and the collection; an unused one deletes; once the record drops the link, the delete works), full suite, build.
