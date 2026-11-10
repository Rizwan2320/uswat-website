import { test, expect } from '@playwright/test'

/* Screenshot baselines (plan P2): three widths in both directions. Run with `pnpm test:visual`.
   Determinism: reduced motion (counters show final values, the hero stops rotating) and animations off. Baselines are tied to the machine's fonts: regenerate them with
   `pnpm test:visual --update-snapshots` in the same environment that checks them, and review the diff before committing. */
const widths = [1440, 768, 390] as const
const pages = [
  { name: 'home', path: '/' },
  { name: 'style-guide', path: '/design' },
  { name: 'news', path: '/posts' },
  { name: 'not-found', path: '/this-page-does-not-exist' },
]

test.use({ colorScheme: 'light', reducedMotion: 'reduce' })

for (const w of widths) {
  for (const dir of ['ltr', 'rtl'] as const) {
    for (const pg of pages) {
      test(`${pg.name} ${w} ${dir}`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 900 })
        await page.goto('http://localhost:3000' + pg.path, { waitUntil: 'networkidle' })
        if (dir === 'rtl') {
          await page.locator('button[lang="ur"]').click()
          await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
        }
        await page.evaluate(() => document.fonts.ready)
        await expect(page).toHaveScreenshot(`${pg.name}-${w}-${dir}.png`, { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.002 })
      })
    }
  }
}
