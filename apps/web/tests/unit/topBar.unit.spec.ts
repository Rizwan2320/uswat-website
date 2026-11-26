import { describe, expect, it } from 'vitest'

import { parentPath, showBack, TOP_BAR_COPY } from '../../src/admin/TopBar/rules'

const ADMIN = '/admin'

describe('top bar (slice 3ap)', () => {
  it('shows Back on a Create screen, a list, an edit screen and a nested screen', () => {
    for (const p of [
      '/admin/collections/forms/create',
      '/admin/collections/forms',
      '/admin/collections/forms/12',
      '/admin/collections/forms/12/versions',
      '/admin/account',
    ])
      expect(showBack(p, ADMIN)).toBe(true)
  })

  it('does not show Back on the dashboard or on a sign-in screen', () => {
    for (const p of [
      '/admin',
      '/admin/',
      '/admin/login',
      '/admin/logout',
      '/admin/forgot',
      '/admin/reset/abc',
      '/admin/create-first-user',
      '/admin/unauthorized',
    ])
      expect(showBack(p, ADMIN)).toBe(false)
  })

  it('does not show Back outside the admin', () => {
    expect(showBack('/academics/departments', ADMIN)).toBe(false)
    expect(showBack('/administrator', ADMIN)).toBe(false)
  })

  it('goes one level up, never above the dashboard', () => {
    expect(parentPath('/admin/collections/forms/create', ADMIN)).toBe('/admin/collections/forms')
    expect(parentPath('/admin/collections/forms', ADMIN)).toBe('/admin')
    expect(parentPath('/admin/globals/header', ADMIN)).toBe('/admin')
    expect(parentPath('/admin/collections/forms/12', ADMIN)).toBe('/admin/collections/forms')
    expect(parentPath('/admin/collections/forms/12/versions', ADMIN)).toBe('/admin/collections/forms/12')
    expect(parentPath('/admin/account', ADMIN)).toBe('/admin')
    expect(parentPath('/admin', ADMIN)).toBe('/admin')
    expect(parentPath('/elsewhere', ADMIN)).toBe('/admin')
  })

  it('works with an admin route that is not /admin', () => {
    expect(showBack('/cms/collections/forms', '/cms')).toBe(true)
    expect(showBack('/cms', '/cms')).toBe(false)
    expect(parentPath('/cms/collections/forms', '/cms')).toBe('/cms')
  })

  it('every label has English and Urdu', () => {
    for (const v of Object.values(TOP_BAR_COPY)) {
      expect(v.en.length).toBeGreaterThan(0)
      expect(v.ur.length).toBeGreaterThan(0)
    }
  })
})
