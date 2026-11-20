/**
 * Slice 3hod in the real admin: a head of an office (an Approver) sees only their own team on the
 * Users screen, adds an Editor, changes their role with the screen's normal whole-document save,
 * and cannot reach anyone else. Same setup as editor-flows.e2e.spec.ts.
 * The rules themselves are proven in tests/int/governance.team.int.spec.ts.
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

test('head: the Users screen lists their own team and no one else', async ({ page }) => {
  await signIn(page, fx.approver)
  await page.goto(`${BASE}/admin/collections/users`)
  const table = page.locator('table')
  await expect(table).toContainText(fx.approver)
  await expect(table).toContainText(fx.editor)
  await expect(table).toContainText(fx.contributor)
  for (const other of ['financeEditor', 'auditor', 'admin', 'siteManager'])
    await expect(table, other).not.toContainText(fx[other])
})

test('head: adds an Editor, changes the role with a normal save, and is refused outside the team', async ({
  page,
}) => {
  await signIn(page, fx.approver)
  const email = `team-${Date.now()}@example.test`
  await page.goto(`${BASE}/admin/collections/users/create`)
  await page.fill('#field-email', email)
  await page.fill('#field-password', fx.password)
  await page.fill('#field-confirm-password', fx.password)
  await page.fill('#field-name', 'Team Person')
  await page.click('#action-save')
  await page.waitForURL(/\/admin\/collections\/users\/\d+/, { timeout: 30_000 })

  // Created as a Contributor of the head's office (the form's defaults, filled in by the hook).
  await expect(page.locator('#field-role .rs__single-value')).toHaveText(/Contributor/)

  // The screen's normal save sends the whole document: role changed, everything else as it was.
  await page.click('#field-role')
  await page.getByRole('option', { name: 'Editor' }).click()
  await page.click('#action-save')
  await expect(page.getByText(/updated successfully/i).first()).toBeVisible({ timeout: 15_000 })
  await page.reload()
  await expect(page.locator('#field-role .rs__single-value')).toHaveText(/Editor/)

  // Someone outside the team is not reachable, even by address.
  await page.goto(`${BASE}/admin/collections/users?search=${encodeURIComponent(fx.financeEditor)}`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('body')).not.toContainText(fx.financeEditor)
})

test('an editor does not get the Users screen', async ({ page }) => {
  await signIn(page, fx.editor)
  await page.goto(`${BASE}/admin/collections/users`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('body')).not.toContainText(fx.contributor)
})
