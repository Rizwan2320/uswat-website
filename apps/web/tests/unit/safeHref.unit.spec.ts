import { describe, expect, it } from 'vitest'

import { isSafeHref, safeHref } from '@/utilities/safeHref'

describe('safeHref', () => {
  it.each([
    'https://uswat.edu.pk/admissions',
    'http://example.test/a.pdf',
    'mailto:registrar@example.test',
    'tel:+920000000000',
    '/posts/some-news',
    '/',
    '#main',
    '  https://example.test/x  ',
  ])('accepts %s', (v) => expect(isSafeHref(v)).toBe(true))

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'java\nscript:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,<script>1</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    '//evil.example/x',
    '/\\evil.example',
    'example.test/no-scheme',
    '',
    '   ',
    null,
    undefined,
  ])('refuses %j', (v) => expect(isSafeHref(v as string)).toBe(false))

  it('returns the trimmed address, or null', () => {
    expect(safeHref('  /posts  ')).toBe('/posts')
    expect(safeHref('javascript:alert(1)')).toBeNull()
  })
})
