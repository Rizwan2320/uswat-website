import { describe, expect, it } from 'vitest'

import { ACADEMIC_ICONS } from '../../src/collections/academics/pageFields'
import { plainTextProblem } from '../../src/governance/plainText'

describe('plain text only (slice 3ad)', () => {
  it.each([
    'The department offers four programmes.',
    'Computer science & information technology',
    'Fees: 2 < 3 and 5 > 4 are fine as sums',
    'میرا نام ہے',
    'See the library at the main campus.',
    '',
  ])('accepts %j', (v) => expect(plainTextProblem(v)).toBeNull())

  it.each([
    ['<b>bold</b>', 'html'],
    ['Click <a href="x">here</a>', 'html'],
    ['<script>alert(1)</script>', 'html'],
    ['</p>', 'html'],
    ['Read [the page](https://example.test/a)', 'markdown-link'],
    ['[x](y)', 'markdown-link'],
    ['Visit https://example.test/apply', 'web-address'],
    ['http://example.test', 'web-address'],
    ['go to www.uswat.edu.pk now', 'web-address'],
    ['javascript:alert(1)', 'web-address'],
    ['ftp://files.example.test/a', 'web-address'],
  ])('refuses %j as %s', (v, kind) => expect(plainTextProblem(v)).toBe(kind))

  it('ignores values that are not text', () => {
    for (const v of [null, undefined, 3, {}, []]) expect(plainTextProblem(v)).toBeNull()
  })
})

describe('the icon list', () => {
  it('is the 20 names the public pages draw, with no duplicates (pinned: equal to IconName in src/site/academics/types.ts)', () => {
    expect([...ACADEMIC_ICONS].sort()).toEqual(
      [
        'book',
        'brain',
        'briefcase',
        'cap',
        'chart',
        'cloud',
        'code',
        'database',
        'flask',
        'gear',
        'globe',
        'layers',
        'network',
        'phone',
        'rocket',
        'search',
        'shield',
        'spark',
        'trophy',
        'users',
      ].sort(),
    )
    expect(new Set(ACADEMIC_ICONS).size).toBe(20)
  })
})
