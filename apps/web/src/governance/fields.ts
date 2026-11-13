/**
 * The shared governance field group (plan v2 7.2 + Addendum 7).
 *
 * One group, named `governance`, added to every governed collection with `withGovernance`.
 * It is a group because a top-level `status` would collide with the enum Payload already
 * creates for `_status`. Fields that only the system or the policy may set are read-only in
 * the admin; the `beforeChange` hook (hooks.ts) is what actually enforces them.
 */

import type { CollectionConfig, Field, TextFieldSingleValidation } from 'payload'
import { text } from 'payload/shared'

import { isSafeHref } from '../utilities/safeHref'

import {
  governanceBeforeChange,
  governanceBeforeDelete,
  governanceBeforeOperation,
  type GovernanceOptions,
} from './hooks'
import { publishGuard } from './mediaGuard'
import { notifyNewDraft } from './notify'
import {
  ORIGINS,
  RISK_CLASSES,
  RISK_LABELS,
  VERIFICATION_STATUSES,
  WORKFLOW_LABELS,
  WORKFLOW_STATUSES,
} from './roles'

/**
 * Validator for a link typed into the CMS: it keeps the field's normal rules (required, length)
 * and then accepts only what `isSafeHref` accepts. The site applies the same function where it
 * renders the value, so the two guards cannot drift (main agent review of PR #5, R1).
 */
export const safeHrefValidate: TextFieldSingleValidation = (value, options) => {
  const base = text(value, options)
  if (base !== true) return base
  if (value == null || value === '') return true
  return isSafeHref(value)
    ? true
    : 'Use a web address (https://...), an email (mailto:...), a phone (tel:...) or a path on this site (/...).'
}

const options = <T extends string>(values: readonly T[], labels?: Record<T, string>) =>
  values.map((value) => ({ value, label: labels?.[value] ?? value }))

const ORIGIN_LABELS = {
  editor: 'Written by an editor',
  importer: 'Imported from the old site',
  watcher: 'Found by the source watcher',
} as const
const VERIFICATION_LABELS = {
  unverified: 'Not verified yet',
  verified: 'Verified',
  stale: 'Needs a new check',
} as const
// Shown only for records that did not start with an editor (imports), so editors never see them.
const NOT_FROM_EDITOR = (_data: unknown, siblingData: { origin?: string } | undefined) =>
  Boolean(siblingData?.origin && siblingData.origin !== 'editor')

export const governanceFields: Field[] = [
  {
    name: 'status',
    label: 'Stage',
    type: 'select',
    defaultValue: 'draft',
    options: options(WORKFLOW_STATUSES, WORKFLOW_LABELS),
    index: true,
    admin: {
      description:
        'Draft, In review, Approved, Published or Archived. What you can move it to depends on your role.',
    },
  },
  {
    name: 'ownerOffice',
    label: 'Owner office',
    type: 'text',
    index: true,
    // New records start with the person's first office. Without this the admin's first automatic
    // draft save has no office and an editor is refused before typing anything (found in a real
    // browser; the create page came up blank). A person with several offices can change it.
    defaultValue: ({ user }) => {
      const offices = (user as { offices?: unknown } | null)?.offices
      return Array.isArray(offices) && typeof offices[0] === 'string' ? offices[0] : undefined
    },
    admin: {
      description:
        'The office accountable for this record (for example "Registrar"). Required to publish.',
    },
  },
  {
    name: 'source',
    label: 'Source of the facts',
    type: 'text',
    admin: {
      description:
        'A web address or the name of a document, for example "Notification no. 123, dated 3 March". Needed before this can be published.',
    },
  },
  {
    name: 'verificationStatus',
    label: 'Fact-check',
    type: 'select',
    defaultValue: 'unverified',
    options: options(VERIFICATION_STATUSES, VERIFICATION_LABELS),
    index: true,
    admin: {
      description:
        'Only a reviewer can mark a record Verified. A record that is not verified cannot be published.',
    },
  },
  {
    name: 'verifiedAt',
    label: 'Verified on',
    type: 'date',
    admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
  },
  {
    name: 'reviewDueAt',
    label: 'Check again by',
    type: 'date',
    admin: {
      description: 'The date someone should re-check this. Needed to publish a high-impact record.',
    },
  },
  {
    name: 'riskClass',
    label: 'How sensitive is it?',
    type: 'select',
    defaultValue: 'standard',
    options: options(RISK_CLASSES, RISK_LABELS),
    admin: {
      description:
        'Choose High impact for fees, admissions, deadlines, merit lists and legal notices. An approver must publish these.',
    },
  },
  {
    name: 'publishAt',
    label: 'Go live on',
    type: 'date',
    admin: {
      description:
        'Optional. Set the Stage to Approved and this item goes live by itself at this time.',
      date: { pickerAppearance: 'dayAndTime' },
    },
  },
  {
    name: 'expireAt',
    label: 'Take down on',
    type: 'date',
    admin: {
      description: 'Optional. After this time the item is archived and no longer shown.',
      date: { pickerAppearance: 'dayAndTime' },
    },
  },
  {
    name: 'origin',
    label: 'Where this came from',
    type: 'select',
    defaultValue: 'editor',
    options: options(ORIGINS, ORIGIN_LABELS),
    admin: { readOnly: true, condition: NOT_FROM_EDITOR },
  },
  // Internal change-detection fingerprints: kept in the data, never shown to editors.
  {
    name: 'contentHash',
    label: 'Content fingerprint',
    type: 'text',
    admin: { readOnly: true, hidden: true },
  },
  {
    name: 'sourceContentHash',
    label: 'Source fingerprint',
    type: 'text',
    admin: { readOnly: true, hidden: true },
  },
  {
    name: 'collectedAt',
    label: 'Collected on',
    type: 'date',
    admin: { readOnly: true, condition: NOT_FROM_EDITOR },
  },
  {
    name: 'pinned',
    label: 'Keep in current lists',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description:
        'Notices drop out of the current list after 90 days unless this is ticked and there is no take-down date. Reviewers only.',
    },
  },
  {
    name: 'createdBy',
    label: 'Created by',
    type: 'relationship',
    relationTo: 'users',
    admin: { readOnly: true },
  },
]

export const governanceGroup: Field = {
  name: 'governance',
  label: 'Ownership and approval',
  type: 'group',
  admin: { position: 'sidebar' },
  fields: governanceFields,
}

/**
 * Add the governance group and the policy hook to a collection config.
 * `contentFields` names the top-level fields whose change counts as a content edit.
 */
export function withGovernance<T extends CollectionConfig>(
  config: T,
  contentFields: readonly string[],
  options: GovernanceOptions = {},
): T {
  return {
    ...config,
    fields: [...config.fields, governanceGroup],
    hooks: {
      ...config.hooks,
      beforeOperation: [governanceBeforeOperation, ...(config.hooks?.beforeOperation ?? [])],
      beforeChange: [
        governanceBeforeChange(contentFields, options),
        publishGuard,
        ...(config.hooks?.beforeChange ?? []),
      ],
      afterChange: [...(config.hooks?.afterChange ?? []), notifyNewDraft],
      beforeDelete: [governanceBeforeDelete, ...(config.hooks?.beforeDelete ?? [])],
    },
  }
}
