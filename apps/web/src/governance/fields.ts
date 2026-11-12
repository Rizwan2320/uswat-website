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

const ORIGIN_LABELS = { editor: 'Editor', importer: 'Importer', watcher: 'Source watcher' } as const
const VERIFICATION_LABELS = {
  unverified: 'Unverified',
  verified: 'Verified',
  stale: 'Stale',
} as const

export const governanceFields: Field[] = [
  {
    name: 'status',
    label: 'Workflow status',
    type: 'select',
    defaultValue: 'draft',
    options: options(WORKFLOW_STATUSES, WORKFLOW_LABELS),
    index: true,
    admin: {
      description:
        'Draft, In review, Approved, Published, Archived. Moves are checked against your role when you save.',
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
    type: 'text',
    admin: {
      description: 'Where the facts come from: a URL or a named document. Required to publish.',
    },
  },
  {
    name: 'verificationStatus',
    label: 'Verification',
    type: 'select',
    defaultValue: 'unverified',
    options: options(VERIFICATION_STATUSES, VERIFICATION_LABELS),
    index: true,
    admin: {
      description:
        'Only a reviewer can mark a record verified. Unverified records cannot be published.',
    },
  },
  {
    name: 'verifiedAt',
    label: 'Verified at',
    type: 'date',
    admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
  },
  {
    name: 'reviewDueAt',
    label: 'Review due',
    type: 'date',
    admin: { description: 'Required to publish a high-impact record.' },
  },
  {
    name: 'riskClass',
    label: 'Risk class',
    type: 'select',
    defaultValue: 'standard',
    options: options(RISK_CLASSES, RISK_LABELS),
    admin: {
      description:
        'High-impact: fees, admissions, deadlines, merit lists, legal notices. Needs an approver.',
    },
  },
  {
    name: 'publishAt',
    label: 'Publish at',
    type: 'date',
    admin: { date: { pickerAppearance: 'dayAndTime' } },
  },
  {
    name: 'expireAt',
    label: 'Expire at',
    type: 'date',
    admin: { date: { pickerAppearance: 'dayAndTime' } },
  },
  {
    name: 'origin',
    type: 'select',
    defaultValue: 'editor',
    options: options(ORIGINS, ORIGIN_LABELS),
    admin: { readOnly: true },
  },
  { name: 'contentHash', label: 'Content hash', type: 'text', admin: { readOnly: true } },
  {
    name: 'sourceContentHash',
    label: 'Source content hash',
    type: 'text',
    admin: { readOnly: true },
  },
  { name: 'collectedAt', label: 'Collected at', type: 'date', admin: { readOnly: true } },
  {
    name: 'pinned',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description:
        'A pinned notice with no expiry date stays in current lists past the 90-day age-out. Reviewers only.',
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
  label: 'Governance',
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
