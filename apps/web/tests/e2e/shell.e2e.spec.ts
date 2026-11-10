import { expect, test } from '@playwright/test'

/* Runs against a server on localhost:3000 (like kit.e2e). ADR-0011: pages that come from the CMS use the site shell, not the stock template.
   These routes need no seeded content (an empty list and an unknown address are valid states). */
for (const path of ['/posts', '/search', '/this-page-does-not-exist', '/a/b/c']) {
  test.describe(`shell on ${path}`, () => {
    test('uses the site header, footer, one h1 and no Geist', async ({ page }) => {
      const requests: string[] = []
      page.on('request', (r) => requests.push(r.url()))
      await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' })

      await expect(page.locator('.site-head')).toHaveCount(1)
      await expect(page.locator('footer')).toHaveCount(1)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
      expect(requests.filter((u) => /geist/i.test(u))).toEqual([])
      const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
      expect(bodyFont).toContain('Inter')
    })

    test('does not scroll sideways at 360px', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 })
      await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' })
      const [sw, cw] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        document.documentElement.clientWidth,
      ])
      expect(sw).toBeLessThanOrEqual(cw)
    })
  })
}
