import { expect, test } from '@playwright/test'

/* Pages that have a profile in code must open with an empty database (production holds no content yet). They used to answer 404 because
   the route looked for a CMS record first. The database in this job is empty, so a 200 here proves the profile alone is enough. */
const pages = [
  '/administration/oric-2',
  '/administration/controller-of-examination-office',
  '/administration/directorate-of-it',
  '/administration/directorate-of-works',
  '/administration/advanced-studies-and-research-board',
  '/administration/proctorial-board',
  '/administration/hunerkada-center-for-excellence',
  '/administration/kamyab-jawan-markaz',
  '/administration/alumni',
  '/academics/departments/dcst',
  '/academics/programmes/bs-computer-science',
  '/academic-calendar',
  '/administration/central-library-office',
  '/administration/quality-enhancement-cell',
  '/academics/departments/management-commerce',
  '/academics/departments/english-and-foreign-languages',
]
for (const path of pages) {
  test(`${path} opens from its profile with no CMS record`, async ({ page }) => {
    const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' })
    expect(res?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toHaveCount(0)
  })
}

test('an office address with no profile and no record is still a 404', async ({ page }) => {
  const res = await page.goto('http://localhost:3000/administration/no-such-office', { waitUntil: 'networkidle' })
  expect(res?.status()).toBe(404)
})
