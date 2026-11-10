import { test, expect } from '@playwright/test'

/* Keyboard and structure checks for the inner-page kit on /design. Runs against a server on localhost:3000. */
const url = 'http://localhost:3000/design'

test.describe('Kit on /design', () => {
  test('has one h1, a breadcrumb trail and a current page', async ({ page }) => {
    await page.goto(url)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByRole('navigation', { name: 'Breadcrumb', exact: true }).locator('[aria-current="page"]')).toHaveText('Style guide')
  })

  test('accordion: Enter toggles, arrows and Home/End move between headings', async ({ page }) => {
    await page.goto(url)
    const heads = page.getByRole('button', { name: /accordion behave|several panels|keyboard accessible/ })
    await heads.nth(0).focus()
    await expect(heads.nth(0)).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('ArrowDown')
    await expect(heads.nth(1)).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(heads.nth(1)).toHaveAttribute('aria-expanded', 'true')
    await expect(heads.nth(0)).toHaveAttribute('aria-expanded', 'false')
    await page.keyboard.press('End')
    await expect(heads.nth(2)).toBeFocused()
    await page.keyboard.press('Home')
    await expect(heads.nth(0)).toBeFocused()
  })

  test('tabs: arrows move and activate, only the active tab is tabbable', async ({ page }) => {
    await page.goto(url)
    const tabs = page.getByRole('tab')
    await tabs.nth(0).focus()
    await page.keyboard.press('ArrowRight')
    await expect(tabs.nth(1)).toBeFocused()
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(tabs.nth(0)).toHaveAttribute('tabindex', '-1')
    await page.keyboard.press('End')
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('ArrowRight')
    await expect(tabs.nth(0)).toBeFocused()
  })

  test('pagination marks the current page', async ({ page }) => {
    await page.goto(url)
    const nav = page.getByRole('navigation', { name: 'Pagination' })
    await expect(nav.locator('[aria-current="page"]')).toHaveText('4')
    await expect(nav.getByRole('link', { name: 'Next' })).toBeVisible()
  })
})
