import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/* Draft mode is only a cookie. A public page must never read with `overrideAccess: draft` (or any override tied to draft
   mode), because then anyone holding the cookie, or a stale one after logging out, sees the newest draft of any page.
   Public pages read through `findForPreview`, which takes the person from the login on this request.
   Found by the P3 agent in PR #32; docs/predictions.md row M-1. */
const pages = ['src/app/(site)/(cms)/[slug]/page.tsx', 'src/app/(site)/(cms)/posts/[slug]/page.tsx']

describe('public page routes do not read drafts as the system', () => {
  for (const file of pages) {
    const source = readFileSync(join(__dirname, '../../', file), 'utf8')
    it(`${file} has no overrideAccess tied to draft mode`, () => {
      expect(source).not.toMatch(/overrideAccess:\s*draft\b/)
    })
    it(`${file} reads through findForPreview`, () => {
      expect(source).toMatch(/findForPreview\(/)
    })
  }
})
