import { expect, test } from '@playwright/test'

/* "Our Alumni" on the landing page: three cards (photo + headline), each opening the work. Runs with an empty database. */
test('the landing page shows three alumni cards that open their work', async ({ page }) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  const section = page.getByRole('region', { name: 'Our Alumni' })
  await expect(section).toBeVisible()
  const cards = section.getByRole('article')
  await expect(cards).toHaveCount(3)
  await expect(section.getByText('Sample').first()).toBeVisible()
  for (let i = 0; i < 3; i++) {
    await expect(cards.nth(i).getByRole('img')).toBeVisible()
    await expect(cards.nth(i).getByRole('heading', { level: 3 })).not.toBeEmpty()
  }
  const first = cards.first()
  const title = (await first.getByRole('heading', { level: 3 }).innerText()).trim()
  await first.getByRole('link', { name: title }).click()
  await expect(page).toHaveURL(/\/alumni\/research\/[a-z-]+$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  await expect(page.getByRole('heading', { level: 2, name: 'Abstract' })).toBeVisible()
})

test('every alumni work page and the list page open; an unknown work is a 404', async ({ page, request }) => {
  const list = await request.get('http://localhost:3000/alumni/research')
  expect(list.status()).toBe(200)
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  const links = await page.getByRole('region', { name: 'Our Alumni' }).locator('a.stretched').evaluateAll((a) => a.map((x) => (x as HTMLAnchorElement).getAttribute('href')))
  expect(links).toHaveLength(3)
  for (const href of links) expect((await request.get(`http://localhost:3000${href}`)).status(), String(href)).toBe(200)
  expect((await request.get('http://localhost:3000/alumni/research/no-such-work')).status()).toBe(404)
})

test('the alumni section does not overflow a phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Our Alumni' }).scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
