import { test, expect, type Page } from '@playwright/test'

/* Dark mode (docs/briefs/dark-mode.md): follows the system setting, a button overrides it, the choice is remembered, and
   the right theme is painted before any script from the app has run. */
const URL = 'http://localhost:3000/'
const DARK_PAGE = 'rgb(13, 20, 16)' // --surface in dark
const LIGHT_PAGE = 'rgb(252, 250, 244)' // --ivory
const toggle = (page: Page) => page.getByRole('button', { name: 'Dark mode' })
const pageBg = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor)

test.describe('system dark', () => {
  test.use({ colorScheme: 'dark' })
  test('follows the system setting with no stored choice, and the button says so', async ({ page }) => {
    await page.goto(URL)
    expect(await pageBg(page)).toBe(DARK_PAGE)
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.*/)
  })

  test('a stored light choice beats the system setting, survives a reload, and the button can flip back', async ({ page }) => {
    await page.goto(URL)
    await toggle(page).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    expect(await pageBg(page)).toBe(LIGHT_PAGE)
    expect(await page.evaluate(() => localStorage.getItem('uswat-theme'))).toBe('light')
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
    await page.reload()
    expect(await pageBg(page)).toBe(LIGHT_PAGE)
    await toggle(page).click()
    expect(await pageBg(page)).toBe(DARK_PAGE)
    expect(await page.evaluate(() => localStorage.getItem('uswat-theme'))).toBe('dark')
  })

  test('works from the keyboard', async ({ page }) => {
    await page.goto(URL)
    await toggle(page).focus()
    await page.keyboard.press('Enter')
    expect(await pageBg(page)).toBe(LIGHT_PAGE)
    await page.keyboard.press('Space')
    expect(await pageBg(page)).toBe(DARK_PAGE)
  })

  test('still switches when storage is blocked', async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new Error('blocked')
      }
    })
    await page.goto(URL)
    await toggle(page).click()
    expect(await pageBg(page)).toBe(LIGHT_PAGE)
  })

  test('stays dark in right-to-left and the label is translated', async ({ page }) => {
    await page.goto(URL)
    await page.locator('button[lang="ur"]').click()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    expect(await pageBg(page)).toBe(DARK_PAGE)
    await expect(page.getByRole('button', { name: 'ڈارک موڈ' })).toBeVisible()
  })
})

test.describe('system light', () => {
  test.use({ colorScheme: 'light' })
  test('is light by default', async ({ page }) => {
    await page.goto(URL)
    expect(await pageBg(page)).toBe(LIGHT_PAGE)
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false')
  })

  test('paints a stored dark choice before the app scripts run (no light flash)', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('uswat-theme', 'dark'))
    // Stop the app bundles: only the inline script in <head> can have set the theme.
    await page.route('**/_next/static/**/*.js', (route) => route.abort())
    await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(await pageBg(page)).toBe(DARK_PAGE)
  })

  test('ignores a junk stored value', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('uswat-theme', 'purple'))
    await page.goto(URL)
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.*/)
    expect(await pageBg(page)).toBe(LIGHT_PAGE)
  })
})
