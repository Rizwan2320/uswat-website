/**
 * Each role gets its own buttons and status line on a document (slice 3aa, owner report 2026-11-20).
 * Same setup as editor-flows.e2e.spec.ts (pnpm payload run tests/e2e/support/setup.ts).
 * The rules themselves are in tests/unit/workflowRules.unit.spec.ts; this checks them on a real screen.
 */
import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

const BASE = 'http://localhost:3000'
const fx = JSON.parse(readFileSync('/tmp/uswat-e2e/fixtures.json', 'utf8')) as Record<string, any>
const SHOTS = process.env.SHOTS_DIR

async function signIn(page: Page, email: string) {
  await page.goto(`${BASE}/admin/login`)
  await page.fill('#field-email', email)
  await page.fill('#field-password', fx.password)
  await page.click('button[type=submit]')
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 30_000 })
}
const open = async (page: Page, id: string | number, collection = 'notices') => {
  await page.goto(`${BASE}/admin/collections/${collection}/${id}`)
  await expect(page.getByRole('region', { name: 'Item status' })).toBeVisible({ timeout: 60_000 })
}
/** Payload locks a document for a few minutes after someone had it open; the approver may take over. */
const takeOverIfLocked = async (page: Page) => {
  const take = page.locator('dialog#document-locked').getByRole('button', { name: /Take over/i })
  // The prompt appears a moment after the page loads, and only if the other person had it open.
  const shown = await take.waitFor({ state: 'visible', timeout: 6_000 }).then(() => true, () => false)
  if (shown) await take.click()
}
const bar = (page: Page) => page.getByRole('region', { name: 'Item status' })
const btn = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
/** A click before the page has hydrated does nothing, so press again until the banner shows the result. */
const press = async (page: Page, name: string, expected: string | RegExp) => {
  await expect(async () => {
    const b = btn(page, name)
    if (await b.count()) await b.click({ timeout: 2_000 })
    await expect(bar(page)).toContainText(expected, { timeout: 4_000 })
  }).toPass({ timeout: 60_000 })
}
const shot = async (page: Page, name: string) => {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false })
}

test.describe.configure({ mode: 'serial' })

test('editor: sees Send for review, no Approve, no Publish', async ({ page }) => {
  await signIn(page, fx.editor)
  await open(page, fx.flowNotice.id)
  await expect(bar(page)).toContainText('Draft')
  await expect(btn(page, 'Send for review')).toBeVisible()
  await expect(btn(page, 'Approve')).toHaveCount(0)
  await expect(btn(page, 'Send back')).toHaveCount(0)
  await expect(btn(page, 'Publish changes')).toHaveCount(0)
  await expect(btn(page, 'Publish')).toHaveCount(0)
  await shot(page, 'editor-draft')
})

test('contributor: own draft has no step buttons and no Publish', async ({ page }) => {
  await signIn(page, fx.contributor)
  await open(page, fx.ownNotice.id)
  await expect(bar(page)).toContainText('ask an editor')
  await expect(bar(page).getByRole('button')).toHaveCount(0)
  await expect(btn(page, 'Publish changes')).toHaveCount(0)
  await shot(page, 'contributor-draft')
})

test('auditor: read only banner and no buttons', async ({ page }) => {
  await signIn(page, fx.auditor)
  await open(page, fx.flowNotice.id)
  await expect(bar(page)).toContainText('Read only')
  await expect(bar(page).getByRole('button')).toHaveCount(0)
  await expect(btn(page, 'Publish changes')).toHaveCount(0)
  await shot(page, 'auditor-read-only')
})

test('whole path: editor sends, approver sends back with a note, editor fixes and sends again, approver publishes', async ({
  browser,
}) => {
  const ed = await browser.newPage()
  await signIn(ed, fx.editor)
  await open(ed, fx.flowNotice.id)
  await press(ed, 'Send for review', 'Sent. Your approver sees it under Waiting for review')
  await expect(bar(ed).getByRole('button')).toHaveCount(0)
  await shot(ed, 'editor-sent')
  await ed.close()

  const ap = await browser.newPage()
  await signIn(ap, fx.approver)
  await open(ap, fx.flowNotice.id)
  await takeOverIfLocked(ap)
  await expect(bar(ap)).toContainText('Waiting for your review')
  await expect(btn(ap, 'Approve')).toBeVisible()
  await expect(btn(ap, 'Send back')).toBeVisible()
  await expect(btn(ap, 'Publish changes')).toHaveCount(0)
  await shot(ap, 'approver-in-review')

  // Send back needs a reason: the confirm button stays off until one is typed.
  await expect(async () => {
    await btn(ap, 'Send back').click({ timeout: 2_000 })
    await expect(ap.locator('#workflow-note')).toBeVisible({ timeout: 2_000 })
  }).toPass({ timeout: 30_000 })
  await expect(btn(ap, 'Send back')).toBeDisabled()
  await shot(ap, 'approver-send-back-note')
  await ap.fill('#workflow-note', 'Please add the date of the meeting.')
  await btn(ap, 'Send back').click()
  await expect(bar(ap)).toContainText('Sent back to Draft', { timeout: 30_000 })
  await ap.close()

  const ed2 = await browser.newPage()
  await signIn(ed2, fx.editor)
  await open(ed2, fx.flowNotice.id)
  await takeOverIfLocked(ed2)
  await expect(bar(ed2)).toContainText('Sent back: Please add the date of the meeting.')
  await shot(ed2, 'editor-sees-note')
  await press(ed2, 'Send for review', 'Sent. Your approver sees it under Waiting for review')
  await expect(bar(ed2)).not.toContainText('Sent back:')
  await ed2.close()

  const ap2 = await browser.newPage()
  await signIn(ap2, fx.approver)
  await open(ap2, fx.flowNotice.id)
  await takeOverIfLocked(ap2)
  await expect(bar(ap2)).toContainText('Waiting for your review')
  await press(ap2, 'Mark verified', 'Marked as verified')
  await press(ap2, 'Approve', /Approved\. (Before|An approver|Press)/)
  await expect(btn(ap2, 'Publish changes')).toBeVisible()
  await shot(ap2, 'approver-approved')
  await btn(ap2, 'Publish changes').click()
  await expect(ap2.getByText(/Published|updated successfully/i).first()).toBeVisible({
    timeout: 30_000,
  })
  await ap2.close()
})

test('a refused step leaves the stage as it was and says why', async ({ page }) => {
  await signIn(page, fx.editor)
  await open(page, fx.noExpiry.id, 'events')
  await btn(page, 'Send for review').click()
  await expect(page.getByText(/Take down on/).first()).toBeVisible({ timeout: 30_000 })
  await expect(bar(page)).toContainText('Draft')
  await expect(bar(page)).not.toContainText('Sent.')
  await expect(btn(page, 'Send for review')).toBeVisible()
  await shot(page, 'editor-refused')
})

test('Urdu on a phone: banner and buttons in Urdu, no sideways scroll', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await ctx.addCookies([{ name: 'payload-lng', value: 'ur', url: BASE }])
  const page = await ctx.newPage()
  await signIn(page, fx.editor)
  await page.goto(`${BASE}/admin/collections/events/${fx.noExpiry.id}`)
  const region = page.locator('section.workflow-bar')
  await expect(region).toBeVisible({ timeout: 60_000 })
  await expect(region).toContainText('مسودہ')
  await expect(region.getByRole('button', { name: 'جائزے کے لیے بھیجیں' })).toBeVisible()
  const sideways = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  )
  expect(sideways).toBe(false)
  await shot(page, 'editor-urdu-390')
  await ctx.close()
})
