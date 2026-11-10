import { test, expect, type Page } from '@playwright/test'

/* Keyboard behaviour of the mobile drawer (plan gate G2: "keyboard test passes for navigation, drawer and accordion").
   Runs against a server on localhost:3000, at a phone width, in both directions. */
test.use({ viewport: { width: 390, height: 844 } })

const open = async (page: Page, rtl: boolean) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  if (rtl) {
    await page.locator('button[lang="ur"]').click()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  }
  const burger = page.locator('button[class*="burger"]')
  await burger.focus()
  await page.keyboard.press('Enter')
  const drawer = page.locator('dialog#mobile-drawer')
  await expect(drawer).toBeVisible()
  return { burger, drawer }
}

for (const rtl of [false, true]) {
  test.describe(`mobile drawer (${rtl ? 'RTL' : 'LTR'})`, () => {
    test('opens with Enter and moves focus inside', async ({ page }) => {
      const { drawer } = await open(page, rtl)
      await expect.poll(() => drawer.evaluate((d) => d.contains(document.activeElement))).toBe(true)
    })

    // A modal <dialog> makes the page behind inert. After its last control the browser hands focus to its own UI for one
    // step (document.activeElement is then <body>) and wraps back in. What must never happen is focus on page content behind.
    test('Tab and Shift+Tab stay in the drawer and never reach the page behind', async ({ page }) => {
      const { drawer } = await open(page, rtl)
      const inDrawerOrBrowserUi = () => drawer.evaluate((d) => d.contains(document.activeElement) || document.activeElement === document.body)
      let wrapped = false
      for (const key of ['Tab', 'Shift+Tab']) {
        for (let i = 0; i < 14; i++) {
          await page.keyboard.press(key)
          expect(await inDrawerOrBrowserUi()).toBe(true)
          if (await page.evaluate(() => document.activeElement === document.body)) wrapped = true
        }
      }
      expect(wrapped, 'focus should wrap through the browser UI, proving the loop was long enough to cover every control').toBe(true)
    })

    test('a section opens and closes with Enter and Space (accordion)', async ({ page }) => {
      const { drawer } = await open(page, rtl)
      const row = drawer.locator('button[aria-expanded]').first()
      await row.focus()
      await expect(row).toHaveAttribute('aria-expanded', 'false')
      await page.keyboard.press('Enter')
      await expect(row).toHaveAttribute('aria-expanded', 'true')
      await page.keyboard.press('Space')
      await expect(row).toHaveAttribute('aria-expanded', 'false')
    })

    test('Escape closes it and focus returns to the menu button', async ({ page }) => {
      const { burger, drawer } = await open(page, rtl)
      await page.keyboard.press('Escape')
      await expect(drawer).toBeHidden()
      await expect(burger).toBeFocused()
    })

    test('the page behind does not scroll while it is open', async ({ page }) => {
      await open(page, rtl)
      expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
      await page.keyboard.press('Escape')
      await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
    })
  })
}
