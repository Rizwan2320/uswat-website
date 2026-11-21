/**
 * Prepares people and one live page for tests/e2e/editor-flows.e2e.spec.ts.
 * Run with: pnpm payload run tests/e2e/support/setup.ts   (database must be migrated).
 * Writes /tmp/uswat-e2e/fixtures.json. The browser spec itself imports no application code.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { as, getTestPayload, makeUser, PASSWORD, pageData, uniq } from '../../helpers/governance'

const payload = await getTestPayload()
const [editor, approver, admin, contributor, auditor, siteManager, financeEditor] =
  await Promise.all([
    makeUser(payload, 'editor', ['Registrar']),
    makeUser(payload, 'approver', ['Registrar']),
    makeUser(payload, 'platformAdmin'),
    makeUser(payload, 'contributor', ['Registrar']),
    makeUser(payload, 'auditor'),
    makeUser(payload, 'siteManager'),
    makeUser(payload, 'editor', ['Finance']),
  ])

const title = uniq('e2e-page')
const page = await payload.create({
  collection: 'pages',
  draft: true,
  data: pageData({ ownerOffice: 'Registrar' }, title) as never,
  ...as(editor),
})
for (const [u, governance] of [
  [editor, { status: 'in_review' }],
  [approver, { status: 'approved', verificationStatus: 'verified' }],
] as const) {
  await payload.update({
    collection: 'pages',
    id: page.id,
    draft: true,
    data: { governance } as never,
    ...as(u),
  })
}
await payload.update({
  collection: 'pages',
  id: page.id,
  data: { _status: 'published', governance: {} } as never,
  ...as(approver),
})

// A Registrar notice that only exists as a draft, for the role checks.
const notice = await payload.create({
  collection: 'notices',
  draft: true,
  data: { title: uniq('e2e-notice'), governance: { ownerOffice: 'Registrar' } } as never,
  ...as(editor),
})

// For tests/e2e/role-workflow.e2e.spec.ts: a draft with its source filled in (so it can go all the way
// to Published) and a contributor's own draft.
const flowNotice = await payload.create({
  collection: 'notices',
  draft: true,
  data: {
    title: uniq('e2e-flow'),
    governance: { ownerOffice: 'Registrar', source: 'https://example.invalid/sample-source' },
  } as never,
  ...as(editor),
})
const ownNotice = await payload.create({
  collection: 'notices',
  draft: true,
  data: { title: uniq('e2e-own'), governance: { ownerOffice: 'Registrar' } } as never,
  ...as(contributor),
})

// An event with no "Take down on" date: sending it for review is refused by the policy (LIF-04).
const noExpiry = await payload.create({
  collection: 'events',
  draft: true,
  data: { title: uniq('e2e-event'), governance: { ownerOffice: 'Registrar' } } as never,
  ...as(editor),
})

mkdirSync('/tmp/uswat-e2e', { recursive: true })
writeFileSync(
  '/tmp/uswat-e2e/fixtures.json',
  JSON.stringify({
    password: PASSWORD,
    editor: editor.email,
    approver: approver.email,
    admin: admin.email,
    page: { id: page.id, title },
    notice: { id: notice.id, title: notice.title },
    flowNotice: { id: flowNotice.id, title: flowNotice.title },
    ownNotice: { id: ownNotice.id, title: ownNotice.title },
    noExpiry: { id: noExpiry.id, title: noExpiry.title },
    contributor: contributor.email,
    auditor: auditor.email,
    siteManager: siteManager.email,
    financeEditor: financeEditor.email,
  }),
)
process.exit(0)
