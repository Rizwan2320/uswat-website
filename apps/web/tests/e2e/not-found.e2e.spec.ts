import { expect, test } from '@playwright/test'

/* An address that is not a page or a post must show the site's "Page not found" page with a 404 status, not a server error.
   (It used to end in a 500 because the page route read the request headers for every visitor.) */
for (const path of ['/this-page-does-not-exist', '/a/b/c', '/posts/this-post-does-not-exist']) {
  test(`${path} answers 404 with the Page not found page`, async ({ page }) => {
    const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' })
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
  })
}
