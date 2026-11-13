/**
 * CMS-15 task flows in the real admin, as an editor and an approver: write a notice, send it for
 * review, review and publish it, add an image, edit a live page, schedule.
 *
 * Needs a running app on localhost:3000 and a migrated database. First run
 *   pnpm payload run tests/e2e/support/setup.ts
 * which creates the people and writes /tmp/uswat-e2e/fixtures.json. This spec imports no
 * application code; it checks what the screen did through the REST API as a platform admin.
 */
import { expect, test, type Page } from '@playwright/test'
import { randomBytes } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const BASE = 'http://localhost:3000'
const fx = JSON.parse(readFileSync('/tmp/uswat-e2e/fixtures.json', 'utf8')) as {
  password: string
  editor: string
  approver: string
  admin: string
  page: { id: number; title: string }
}
let n = 0
const uniq = (l: string) => `${l}-${Date.now().toString(36)}-${++n}`

let adminToken = ''
async function api(p: string) {
  if (!adminToken) {
    const r = await fetch(`${BASE}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fx.admin, password: fx.password }),
    })
    adminToken = ((await r.json()) as { token: string }).token
  }
  const r = await fetch(`${BASE}/api/${p}`, { headers: { Authorization: `JWT ${adminToken}` } })
  return (await r.json()) as any
}
const notice = async (title: string) =>
  (await api(`notices?where[title][equals]=${encodeURIComponent(title)}&draft=true&depth=0`))
    .docs[0]

async function signIn(page: Page, email: string) {
  await page.goto(`${BASE}/admin/login`)
  await page.fill('#field-email', email)
  await page.fill('#field-password', fx.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE}/admin`)
  await expect(page.locator('.editor-dashboard')).toBeVisible()
}

/** Pick an option in a Payload select by its field id. */
async function choose(page: Page, fieldId: string, label: string) {
  await page.locator(`#${fieldId}`).click()
  await page.getByRole('option', { name: label, exact: true }).click()
}

/** Draft collections save by themselves a second after you stop typing; there is no Save button. */
const eventually = <T>(fn: () => Promise<T>) =>
  expect.poll(fn, { timeout: 20000, intervals: [500] })

/** Upload collections have a Save button. */
const saveButton = async (page: Page) => {
  await page.locator('#action-save').click()
  await expect(
    page.locator('.toast-success, [data-sonner-toast][data-type="success"]').first(),
  ).toBeVisible({
    timeout: 15000,
  })
}

test.describe('editor and approver in the admin', () => {
  test('tasks 1, 5 and review: write a notice, send it for review, approve and publish it', async ({
    page,
    browser,
  }) => {
    const title = uniq('e2e-notice')
    await signIn(page, fx.editor)
    await expect(page.locator('.editor-dashboard')).toContainText('My drafts')

    await page.goto(`${BASE}/admin/collections/notices/create`)
    await page.fill('input[name="title"]', title)
    await page.fill('input[name="governance.source"]', 'https://example.test/source')
    // Owner office is filled in from the editor's single office.
    await expect(page.locator('input[name="governance.ownerOffice"]')).toHaveValue('registrar')
    await eventually(async () => (await notice(title))?.governance?.status).toBe('draft')
    const saved = await notice(title)

    await choose(page, 'field-governance__status', 'In review')
    await eventually(async () => (await notice(title)).governance.status).toBe('in_review')

    // The approver finds it on their dashboard, approves, verifies and publishes.
    const ap = await (await browser.newContext()).newPage()
    await signIn(ap, fx.approver)
    await expect(ap.locator('.editor-dashboard')).toContainText(title)
    await ap.getByRole('link', { name: title }).first().click()
    await ap.waitForURL(new RegExp(`/admin/collections/notices/${saved.id}`))
    await choose(ap, 'field-governance__status', 'Approved')
    await choose(ap, 'field-governance__verificationStatus', 'Verified')
    await eventually(async () => (await notice(title)).governance.status).toBe('approved')
    await ap.getByRole('button', { name: 'Publish changes' }).click()
    await expect
      .poll(async () => (await api(`notices/${saved.id}?depth=0`))._status, { timeout: 20000 })
      .toBe('published')
  })

  test('task 4: upload an image; alt text is required', async ({ page }) => {
    const dir = '/tmp/uswat-e2e'
    mkdirSync(dir, { recursive: true })
    const file = path.join(dir, `${uniq('pic')}.png`)
    writeFileSync(
      file,
      await sharp(randomBytes(32 * 32 * 3), { raw: { width: 32, height: 32, channels: 3 } })
        .png()
        .toBuffer(),
    )
    const alt = uniq('Lecture hall')
    await signIn(page, fx.editor)
    await page.goto(`${BASE}/admin/collections/media/create`)
    await page.setInputFiles('input[type="file"]', file)
    await page.locator('#action-save').click()
    // Without alt text the save is refused and the message says why.
    await expect(page.getByText(/alt text/i).first()).toBeVisible({ timeout: 15000 })
    await page.fill('input[name="alt"]', alt)
    await saveButton(page)
    const media = await api(`media?where[alt][equals]=${encodeURIComponent(alt)}&depth=0`)
    expect(media.docs).toHaveLength(1)
    expect(media.docs[0].rightsStatus).toBe('unknown')
  })

  test('task 2: edit a live page; the public page does not change until publish', async ({
    page,
  }) => {
    await signIn(page, fx.editor)
    await page.goto(`${BASE}/admin/collections/pages/${fx.page.id}`)
    const edited = `${fx.page.title} (edited)`
    await page.fill('input[name="title"]', edited)
    await eventually(async () => (await api(`pages/${fx.page.id}?depth=0&draft=true`)).title).toBe(
      edited,
    )
    expect((await api(`pages/${fx.page.id}?depth=0`)).title).toBe(fx.page.title)
  })

  test('task 3: schedule a notice with publish and expiry dates', async ({ page }) => {
    const title = uniq('e2e-schedule')
    await signIn(page, fx.editor)
    await page.goto(`${BASE}/admin/collections/notices/create`)
    await page.fill('input[name="title"]', title)
    await page.fill('input[name="governance.source"]', 'https://example.test/source')
    await page.locator('#field-governance__publishAt input').first().fill('12/20/2026 09:00 AM')
    await page.locator('#field-governance__expireAt input').first().fill('01/20/2027 09:00 AM')
    await eventually(async () => (await notice(title))?.governance?.expireAt).toBeTruthy()
    const g = (await notice(title)).governance
    expect(new Date(g.publishAt).getUTCFullYear()).toBe(2026)
    expect(new Date(g.expireAt).getUTCFullYear()).toBe(2027)
  })
})
