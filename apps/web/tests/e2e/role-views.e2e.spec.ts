/**
 * What each role sees in the real admin (P3m): menu, create button, and the message when a role is
 * not allowed. Found by a browser pass as every role; the integration tests could not see any of it.
 * Same setup as editor-flows.e2e.spec.ts (pnpm payload run tests/e2e/support/setup.ts).
 * Menu hiding is tidiness only; access is proven in tests/int/access.matrix.int.spec.ts.
 */
import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

const BASE = 'http://localhost:3000'
const fx = JSON.parse(readFileSync('/tmp/uswat-e2e/fixtures.json', 'utf8')) as Record<string, any>

async function signIn(page: Page, email: string) {
  await page.goto(`${BASE}/admin/login`)
  await page.fill('#field-email', email)
  await page.fill('#field-password', fx.password)
  await page.click('button[type=submit]')
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 30_000 })
}
const menu = async (page: Page) =>
  (await page.locator('nav a').allInnerTexts()).map((t) => t.trim()).filter(Boolean)

const SETTINGS = ['Users', 'Redirects', 'Forms', 'Search Results', 'Header', 'Footer']

for (const who of ['contributor', 'editor', 'approver', 'financeEditor'] as const) {
  test(`${who}: the menu has no settings areas they cannot use, and content areas are there`, async ({
    page,
  }) => {
    await signIn(page, fx[who])
    await page.waitForTimeout(2000)
    const items = await menu(page)
    for (const s of SETTINGS) expect(items, `${who} should not see ${s}`).not.toContain(s)
    for (const s of ['Pages', 'Media', 'Notices', 'Events', 'People']) expect(items).toContain(s)
  })
}

for (const who of ['auditor', 'siteManager'] as const) {
  test(`${who}: sees the settings areas`, async ({ page }) => {
    await signIn(page, fx[who])
    await page.waitForTimeout(2000)
    const items = await menu(page)
    for (const s of SETTINGS) expect(items).toContain(s)
  })
}

test('auditor: no Create New button, and a direct create address says not allowed in plain words', async ({
  page,
}) => {
  await signIn(page, fx.auditor)
  await page.goto(`${BASE}/admin/collections/notices`)
  await expect(page.getByRole('heading', { name: 'Notices' })).toBeVisible()
  await expect(page.getByText('Create New')).toHaveCount(0)
  await page.goto(`${BASE}/admin/collections/notices/create`)
  await expect(page.getByText(/Not allowed\. You are signed out, or your role/)).toBeVisible()
  await expect(page.getByText(/you must be logged in/i)).toHaveCount(0)
})

test('editor of another office: a Registrar notice address gives a clear message, not a crash', async ({
  page,
}) => {
  await signIn(page, fx.financeEditor)
  await page.goto(`${BASE}/admin/collections/notices/${fx.notice.id}`)
  await expect(page.getByText(/could not be found.*may not have access/i)).toBeVisible()
  await expect(page.locator('#field-title')).toHaveCount(0)
})

test('contributor: cannot open a Registrar notice written by someone else', async ({ page }) => {
  await signIn(page, fx.contributor)
  await page.goto(`${BASE}/admin/collections/notices/${fx.notice.id}`)
  await expect(page.locator('#field-title')).toHaveCount(0)
})

test('editor: an untitled draft is named as untitled on the dashboard, not by a bare number', async ({
  page,
}) => {
  await signIn(page, fx.editor)
  // Opening a create form saves an empty draft straight away.
  await page.goto(`${BASE}/admin/collections/notices/create`)
  await expect(page.locator('#field-title')).toBeVisible()
  await page.waitForTimeout(4000)
  await page.goto(`${BASE}/admin`)
  await expect(page.getByText(/Untitled \(started \d{4}-\d{2}-\d{2}, #\d+\)/).first()).toBeVisible()
})
