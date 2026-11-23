import { expect, test } from '@playwright/test'

/* Top bar: the CMS link and the Departments search. Runs against a server on localhost:3000. The department list is
   answered by the test (page.route), so it needs no seeded content, and the pages the visitor is sent to are only checked by address. */
const departments = [
  {
    name: 'Department of Computer Science',
    slug: 'computer-science',
    group: 'Faculty of Sciences',
  },
  { name: 'Department of English', slug: 'english', group: 'Faculty of Arts' },
  { name: 'Department of Pharmacy', slug: 'pharmacy', group: 'Faculty of Pharmacy' },
]

test.beforeEach(async ({ page }) => {
  await page.route('**/api/department-options', (route) => route.fulfill({ json: { departments } }))
  await page.route('**/academics/departments/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<h1>stub</h1>' }),
  )
})

test('has a CMS link to this site\'s own admin sign-in and a Departments button', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  const bar = page.getByRole('navigation', { name: 'Portals and language' })
  await expect(bar.getByRole('link', { name: 'CMS' })).toHaveAttribute('href', '/admin')
  await expect(bar.getByRole('link', { name: 'Student Portal' })).toHaveAttribute(
    'href',
    /^https:\/\/cms1\.uswat\.edu\.pk/,
  )
  await expect(bar.getByRole('button', { name: 'Departments' })).toBeVisible()
})

test('typing a name narrows the list and Enter opens that department', async ({ page }) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Departments' }).click()
  const box = page.getByRole('combobox', { name: 'Find a department' })
  await expect(box).toBeFocused()
  await expect(page.getByRole('option')).toHaveCount(3)
  await box.fill('pharm')
  await expect(page.getByRole('option')).toHaveCount(1)
  await box.press('Enter')
  await page.waitForURL('**/academics/departments/pharmacy')
})

test('arrow keys and a click choose a match; no match says so; Esc closes', async ({ page }) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Departments' }).click()
  const box = page.getByRole('combobox', { name: 'Find a department' })
  await box.press('ArrowDown')
  await expect(page.getByRole('option', { name: /English/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await box.fill('astrophysics')
  await expect(page.getByText('No department matches your search.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('combobox')).toBeHidden()
  await page.getByRole('button', { name: 'Departments' }).click()
  await page.getByRole('option', { name: /Computer Science/ }).click()
  await page.waitForURL('**/academics/departments/computer-science')
})

test('shows an error when the list cannot be loaded, and does not scroll sideways at 360px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.route('**/api/department-options', (route) =>
    route.fulfill({ status: 503, json: { departments: [], error: true } }),
  )
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.getByRole('button', { name: 'Departments' }).click()
  await expect(page.getByText('Departments could not be loaded. Please try again.')).toBeVisible()
})
