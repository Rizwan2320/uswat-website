/**
 * The top bar (slice 3ap): a Back button and a Sign out link on every admin screen.
 * Pure rules, so they are unit-tested without a browser. English and Urdu; the Urdu lines are drafts
 * for a native reader to check.
 */

export const TOP_BAR_COPY = {
  back: { en: 'Back', ur: 'واپس' },
  backTo: { en: 'Go back to the previous screen', ur: 'پچھلی سکرین پر واپس جائیں' },
  signOut: { en: 'Sign out', ur: 'لاگ آؤٹ' },
  signedInAs: { en: 'Signed in as', ur: 'سائن ان:' },
  bar: { en: 'Page tools', ur: 'صفحے کے اوزار' },
} as const

const trim = (p: string): string => (p.length > 1 ? p.replace(/\/+$/, '') : p)

/** Screens before sign-in, or that end it, have no "back". */
const AUTH_SCREENS = ['login', 'logout', 'forgot', 'reset', 'create-first-user', 'unauthorized']

/** Back is shown everywhere in the admin except the dashboard itself and the sign-in screens. */
export function showBack(pathname: string, adminRoute: string): boolean {
  const here = trim(pathname)
  const root = trim(adminRoute)
  if (here === root || here === '' || here === '/') return false
  if (!here.startsWith(`${root}/`)) return false
  const first = here.slice(root.length + 1).split('/')[0] ?? ''
  return !AUTH_SCREENS.includes(first)
}

/**
 * Where Back goes when there is nothing to go back to in this tab (the screen was opened directly):
 * one level up, never above the dashboard. `/admin/collections/forms/create` goes to `/admin/collections/forms`.
 */
export function parentPath(pathname: string, adminRoute: string): string {
  const root = trim(adminRoute)
  const here = trim(pathname)
  if (here === root || !here.startsWith(`${root}/`)) return root
  const up = here.slice(0, here.lastIndexOf('/'))
  // /admin/collections and /admin/globals are not screens of their own: the list's parent is the dashboard.
  if (up.length <= root.length || up === `${root}/collections` || up === `${root}/globals`) return root
  return up
}
