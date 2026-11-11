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

  test('blockquote keeps its padding on the same side as its rule when the prose is right-to-left', async ({ page }) => {
    // Prose is dir="auto", so Urdu body text flips the block on its own. Set the direction on the quote
    // directly to prove the rule and the padding move together.
    await page.goto(url)
    const quote = page.locator('blockquote').first()
    for (const dir of ['ltr', 'rtl'] as const) {
      const s = await quote.evaluate((el, d) => {
        el.setAttribute('dir', d)
        const c = getComputedStyle(el)
        return { pl: c.paddingLeft, pr: c.paddingRight, bl: c.borderLeftWidth, br: c.borderRightWidth }
      }, dir)
      const [ruleSide, padSide, otherPad] = dir === 'rtl' ? [s.br, s.pr, s.pl] : [s.bl, s.pl, s.pr]
      expect(ruleSide, `rule side in ${dir}`).toBe('3px')
      expect(padSide, `padding beside the rule in ${dir}`).toBe('18px')
      expect(otherPad, `opposite padding in ${dir}`).toBe('0px')
    }
  })
})
