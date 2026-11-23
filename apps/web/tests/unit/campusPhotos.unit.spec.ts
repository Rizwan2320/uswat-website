import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { CAMPUS_PHOTOS } from '@/site/academics/campusPhotos'

describe('banner photographs shared by every page', () => {
  it('uses the landing page photographs, seven of them, as decoration with empty alt', () => {
    expect(CAMPUS_PHOTOS).toHaveLength(7)
    for (const p of CAMPUS_PHOTOS) {
      expect(p.alt).toBe('')
      expect(p.src.startsWith('/images/hero/')).toBe(true)
    }
  })

  it('points at files that exist', () => {
    for (const p of CAMPUS_PHOTOS) {
      expect(existsSync(join(process.cwd(), 'public', p.src)), p.src).toBe(true)
    }
  })
})
