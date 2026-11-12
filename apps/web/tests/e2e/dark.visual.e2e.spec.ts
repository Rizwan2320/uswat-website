import { test, expect } from '@playwright/test'

/* Dark screenshot baselines (docs/briefs/dark-mode.md). Run with `pnpm test:visual`, same rules as visual.e2e.spec.ts.
   The home page uses the SYSTEM setting (exercises the media-query copy of the dark tokens); the other pages use a stored
   choice with the system set to light (exercises the data-theme copy). */
test.use({ reducedMotion: 'reduce' })

const shots = [
  { name: 'home', path: '/', w: 1440, dir: 'ltr', via: 'system' },
  { name: 'home', path: '/', w: 390, dir: 'ltr', via: 'system' },
  { name: 'home', path: '/', w: 1440, dir: 'rtl', via: 'system' },
  { name: 'style-guide', path: '/design', w: 1440, dir: 'ltr', via: 'stored' },
  { name: 'style-guide', path: '/design', w: 390, dir: 'rtl', via: 'stored' },
] as const

for (const s of shots) {
  test(`dark ${s.name} ${s.w} ${s.dir} (${s.via})`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: s.w, height: 900 }, colorScheme: s.via === 'system' ? 'dark' : 'light' })
    const page = await context.newPage()
    if (s.via === 'stored') await page.addInitScript(() => localStorage.setItem('uswat-theme', 'dark'))
    await page.goto('http://localhost:3000' + s.path, { waitUntil: 'networkidle' })
    if (s.dir === 'rtl') {
      await page.locator('button[lang="ur"]').click()
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    }
    await page.evaluate(() => document.fonts.ready)
    await expect(page).toHaveScreenshot(`dark-${s.name}-${s.w}-${s.dir}.png`, { fullPage: true, animations: 'disabled', maxDiffPixelRatio: 0.002 })
    await context.close()
  })
}
