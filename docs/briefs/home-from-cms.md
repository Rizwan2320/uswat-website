# Brief: the home page reads "Home page content" (landing page, step 1 of the CMS pairing)

**Branch:** `feat/home-from-cms`, from `main`. **Owner request 2026-11-27:** start the CMS work from the landing page; everything on it should change from the platform admin.

## Finding
The `home-content` global (slides and statistics, merged in #117) has been editable in the admin since 2026-11-21, but nothing on the public site read it: `getHero` and `getStats` in `site/lib/content.ts` returned the sourced files. An editor's published change would not have shown on the live page. The cache tag `global_home-content` was already refreshed on every save, with no reader.

## Objective
The slider photographs, their buttons and the statistics bar come from the published global when it is complete, and from `content/*.ts` otherwise.

## Paths touched (site lane, no schema, no migration)
- new `src/site/home/homeMap.ts` (pure mapping), new `src/site/home/homeContent.ts` (cached read, tag `global_home-content`)
- `src/site/lib/content.ts` (two getters)
- tests: `tests/unit/homeMap.unit.spec.ts`, `tests/int/homeFromCms.int.spec.ts`

## Rules
1. Read without a user and without drafts. Only the published version reaches a visitor.
2. Fewer than 3 usable slides or 3 usable figures (the admin's own minimum) falls back to the files, so an empty or half-filled global never empties the page.
3. A picture without a URL, alt text or size is skipped, never shown broken.
4. The headline and the sentence under it stay fixed (owner decision 2026-11-07).

## Risks
- Blob storage: hosted uploads need `BLOB_READ_WRITE_TOKEN` (ADR-0014). Until then an editor cannot add a new photograph on Vercel. Not worked around.
- 300 s cache bound if a refresh were missed; the tag refresh makes the normal case immediate.

## Gate
Typecheck, lint, unit, integration, build, visual home baseline unchanged (the fallback is the current content).

## Next steps on the landing page (need the CMS agent: schema and migration)
Leadership message, admissions banner, quick portals strip, alumni showcase, site settings and footer, navigation, emergency banner.

## Addendum 2026-11-27: slides may be left empty (branch `feat/home-slides-optional`)
- **Finding:** publishing the global needed at least 3 slides with photographs, but production has no media and no Blob store (ADR-0014), so nobody could publish an edited statistics bar.
- **Change (CMS lane, small, no migration; the CMS agent is told):** the slides field drops `minRows` for `slidesCountValidate` (`governance/homeContent.ts`): none is allowed (the site then keeps its standard photographs); if any, 3 to 8 as before. Description and its Urdu line updated. Statistics rules unchanged (3 to 6, source and date unless Sample).
- **Tests:** 'two slides' and 'nine slides' still refused; new case: no slides publishes.
