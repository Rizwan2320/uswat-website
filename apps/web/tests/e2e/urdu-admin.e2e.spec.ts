/**
 * The Urdu admin (P3p). Payload has no Urdu admin language, so Urdu is added by hand (src/i18n/ur.ts).
 * These checks guard what broke or could break in a real browser:
 *  - the Ownership and approval panel is in Urdu when the admin language is Urdu, English otherwise;
 *  - the page is laid out right to left;
 *  - the page is not made 10,000px wide by the rich-text editor's parked menus (the first Urdu run was);
 *  - no raw translation key (for example `lexical:general:placeholder`) shows on screen.
 * Same setup as editor-flows.e2e.spec.ts (pnpm payload run tests/e2e/support/setup.ts).
 */
import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

const BASE = 'http://localhost:3000'
const fx = JSON.parse(readFileSync('/tmp/uswat-e2e/fixtures.json', 'utf8')) as Record<string, any>

async function openNotice(page: Page, language: 'en' | 'ur') {
  await page.context().addCookies([{ name: 'payload-lng', value: language, url: BASE }])
  await page.goto(`${BASE}/admin/login`)
  await page.fill('#field-email', fx.admin)
  await page.fill('#field-password', fx.password)
  await page.click('button[type=submit]')
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 30_000 })
  await page.goto(`${BASE}/admin/collections/notices/${fx.notice.id}`)
  await expect(
    page.getByRole('heading', { level: 1 }).or(page.locator('.doc-header__title')),
  ).toBeVisible({
    timeout: 30_000,
  })
  await page.waitForTimeout(2_000)
}

test('Urdu admin: panel in Urdu, right to left, normal width, no raw keys', async ({ page }) => {
  await openNotice(page, 'ur')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ur')
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).direction)).toBe(
    'rtl',
  )
  const labels = await page.locator('label, legend, h3').allInnerTexts()
  expect(labels.join(' | ')).toContain('ملکیت اور منظوری') // Ownership and approval
  expect(labels.join(' | ')).toContain('مرحلہ') // Stage
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1300)
  expect(await page.evaluate(() => document.body.innerText)).not.toMatch(
    /\b[a-z-]+:[a-zA-Z]+:[a-zA-Z]+\b/,
  )
})

test('English admin is unchanged: panel in English, left to right', async ({ page }) => {
  await openNotice(page, 'en')
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).direction)).toBe(
    'ltr',
  )
  const labels = await page.locator('label, legend, h3').allInnerTexts()
  expect(labels.join(' | ')).toContain('Ownership and approval')
  expect(labels.join(' | ')).not.toContain('ملکیت')
})
