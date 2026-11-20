import { expect, test } from '@playwright/test'

/** Slice 3u: the admin carries the university's identity and the site's type and colours. */
test('sign-in page: crest, name, site fonts, forest button, tab title', async ({ page }) => {
  await page.goto('http://localhost:3000/admin/login')
  await expect(page).toHaveTitle(/University of Swat CMS/)
  const logo = page.getByRole('img', { name: /University of Swat, website content management/ })
  await expect(logo).toBeVisible()
  await expect(logo.locator('img')).toBeVisible()

  const name = page.getByText('University of Swat', { exact: true }).first()
  expect(await name.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Playfair Display')

  // The sign-in button is the site's forest green (a dark, green-led colour), not Payload's grey.
  const button = page.getByRole('button', { name: 'Login' })
  // Computed colours come back as rgb(0 59 23) or, for a mixed colour, color(srgb 0.1 0.3 0.15).
  const css = await button.evaluate((el) => getComputedStyle(el).backgroundColor)
  const scale = css.startsWith('color(') ? 255 : 1
  const [r, g, b] = css
    .replace(/^color\(srgb/, '')
    .match(/\d+(\.\d+)?/g)!
    .slice(0, 3)
    .map((n) => Number(n) * scale)
  expect(g).toBeGreaterThan(r + 10)
  expect(g).toBeGreaterThan(b + 10)
  expect(g).toBeLessThan(110)

  // Body text uses the site's sans face.
  const body = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
  expect(body).toContain('Lato')
})

test('sign-in page in dark mode keeps readable text on a dark page', async ({ page, context }) => {
  await context.addCookies([{ name: 'payload-theme', value: 'dark', url: 'http://localhost:3000' }])
  await page.goto('http://localhost:3000/admin/login')
  const [bg, fg] = await page.evaluate(() => {
    const lum = (c: string) => {
      const scale = c.startsWith('color(') ? 255 : 1
      const [r, g, b] = (c.replace(/^color\(srgb/, '').match(/\d+(\.\d+)?/g) ?? ['0', '0', '0'])
        .slice(0, 3)
        .map((n) => Number(n) * scale)
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const s = getComputedStyle(document.body)
    return [lum(s.backgroundColor), lum(s.color)]
  })
  expect(bg).toBeLessThan(80)
  expect(fg).toBeGreaterThan(160)
})
