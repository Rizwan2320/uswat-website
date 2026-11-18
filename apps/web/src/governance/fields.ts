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

import { bi } from '../i18n/ur'
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

type Words = string | { en: string; ur: string }

const options = <T extends string>(values: readonly T[], labels?: Record<T, Words>) =>
  values.map((value) => ({ value, label: labels?.[value] ?? value }))

/** English comes from roles.ts (the messages use it too); Urdu is a draft, see src/i18n/ur.ts. */
const withUrdu = <T extends string>(english: Record<T, string>, urdu: Record<T, string>) =>
  Object.fromEntries(
    (Object.keys(english) as T[]).map((k) => [k, bi(english[k], urdu[k])]),
  ) as Record<T, Words>

const STAGE_LABELS = withUrdu(WORKFLOW_LABELS, {
  draft: 'مسودہ',
  in_review: 'زیرِ جائزہ',
  approved: 'منظور شدہ',
  published: 'شائع شدہ',
  archived: 'آرکائیو شدہ',
})
const RISK_WORDS = withUrdu(RISK_LABELS, {
  low: 'کم',
  standard: 'عام',
  high_impact: 'زیادہ اثر',
})

const ORIGIN_LABELS = {
  editor: bi('Written by an editor', 'کسی مدیر نے لکھا'),
  importer: bi('Imported from the old site', 'پرانی سائٹ سے درآمد کیا گیا'),
  watcher: bi('Found by the source watcher', 'ماخذ نگران نے ڈھونڈا'),
} as const
const VERIFICATION_LABELS = {
  unverified: bi('Not verified yet', 'ابھی تصدیق نہیں ہوئی'),
  verified: bi('Verified', 'تصدیق شدہ'),
  stale: bi('Needs a new check', 'نئی جانچ درکار ہے'),
} as const
// Shown only for records that did not start with an editor (imports), so editors never see them.
const NOT_FROM_EDITOR = (_data: unknown, siblingData: { origin?: string } | undefined) =>
  Boolean(siblingData?.origin && siblingData.origin !== 'editor')

export const governanceFields: Field[] = [
  {
    name: 'status',
    label: bi('Stage', 'مرحلہ'),
    type: 'select',
    defaultValue: 'draft',
    options: options(WORKFLOW_STATUSES, STAGE_LABELS),
    index: true,
    admin: {
      description: bi(
        'Draft, In review, Approved, Published or Archived. What you can move it to depends on your role.',
        'مسودہ، زیرِ جائزہ، منظور شدہ، شائع شدہ یا آرکائیو شدہ۔ آپ اسے کہاں لے جا سکتے ہیں، یہ آپ کے کردار پر منحصر ہے۔',
      ),
    },
  },
  {
    name: 'ownerOffice',
    label: bi('Owner office', 'ذمہ دار دفتر'),
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
      description: bi(
        'The office accountable for this record (for example "Registrar"). Required to publish.',
        'وہ دفتر جو اس ریکارڈ کا جواب دہ ہے (مثلاً "Registrar")۔ شائع کرنے کے لیے ضروری ہے۔',
      ),
    },
  },
  {
    name: 'source',
    label: bi('Source of the facts', 'معلومات کا ماخذ'),
    type: 'text',
    admin: {
      description: bi(
        'A web address or the name of a document, for example "Notification no. 123, dated 3 March". Needed before this can be published.',
        'ویب ایڈریس یا دستاویز کا نام، مثلاً "Notification no. 123, dated 3 March"۔ شائع کرنے سے پہلے ضروری ہے۔',
      ),
    },
  },
  {
    name: 'verificationStatus',
    label: bi('Fact-check', 'حقائق کی جانچ'),
    type: 'select',
    defaultValue: 'unverified',
    options: options(VERIFICATION_STATUSES, VERIFICATION_LABELS),
    index: true,
    admin: {
      description: bi(
        'Only a reviewer can mark a record Verified. A record that is not verified cannot be published.',
        'صرف جائزہ لینے والا ہی کسی ریکارڈ کو تصدیق شدہ قرار دے سکتا ہے۔ جس کی تصدیق نہ ہو وہ شائع نہیں ہو سکتا۔',
      ),
    },
  },
  {
    name: 'verifiedAt',
    label: bi('Verified on', 'تصدیق کی تاریخ'),
    type: 'date',
    admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
  },
  {
    name: 'reviewDueAt',
    label: bi('Check again by', 'دوبارہ جانچ کی آخری تاریخ'),
    type: 'date',
    admin: {
      description: bi(
        'The date someone should re-check this. Needed to publish a high-impact record.',
        'وہ تاریخ جس تک کسی کو اسے دوبارہ جانچنا ہے۔ زیادہ اثر والے ریکارڈ کو شائع کرنے کے لیے ضروری ہے۔',
      ),
    },
  },
  {
    name: 'riskClass',
    label: bi('How sensitive is it?', 'یہ کتنا حساس ہے؟'),
    type: 'select',
    defaultValue: 'standard',
    options: options(RISK_CLASSES, RISK_WORDS),
    admin: {
      description: bi(
        'Choose High impact for fees, admissions, deadlines, merit lists and legal notices. An approver must publish these.',
        'فیس، داخلوں، آخری تاریخوں، میرٹ فہرستوں اور قانونی نوٹسز کے لیے "زیادہ اثر" چنیں۔ انہیں شائع کرنا منظوری دینے والے کا کام ہے۔',
      ),
    },
  },
  {
    name: 'publishAt',
    label: bi('Go live on', 'شائع ہونے کی تاریخ'),
    type: 'date',
    admin: {
      description: bi(
        'Optional. Set the Stage to Approved and this item goes live by itself at this time.',
        'اختیاری۔ مرحلہ "منظور شدہ" رکھیں تو یہ آئٹم اس وقت خود بخود شائع ہو جائے گا۔',
      ),
      date: { pickerAppearance: 'dayAndTime' },
    },
  },
  {
    name: 'expireAt',
    label: bi('Take down on', 'ہٹانے کی تاریخ'),
    type: 'date',
    admin: {
      description: bi(
        'Optional. After this time the item is archived and no longer shown.',
        'اختیاری۔ اس وقت کے بعد آئٹم آرکائیو ہو جاتا ہے اور دکھایا نہیں جاتا۔',
      ),
      date: { pickerAppearance: 'dayAndTime' },
    },
  },
  {
    name: 'origin',
    label: bi('Where this came from', 'یہ کہاں سے آیا'),
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
    label: bi('Collected on', 'جمع کرنے کی تاریخ'),
    type: 'date',
    admin: { readOnly: true, condition: NOT_FROM_EDITOR },
  },
  {
    name: 'pinned',
    label: bi('Keep in current lists', 'موجودہ فہرستوں میں رکھیں'),
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description: bi(
        'Notices drop out of the current list after 90 days unless this is ticked and there is no take-down date. Reviewers only.',
        'نوٹس 90 دن بعد موجودہ فہرست سے نکل جاتے ہیں، جب تک یہ نہ چنا جائے اور ہٹانے کی تاریخ نہ ہو۔ صرف جائزہ لینے والوں کے لیے۔',
      ),
    },
  },
  {
    name: 'createdBy',
    label: bi('Created by', 'بنانے والا'),
    type: 'relationship',
    relationTo: 'users',
    admin: { readOnly: true },
  },
]

export const governanceGroup: Field = {
  name: 'governance',
  label: bi('Ownership and approval', 'ملکیت اور منظوری'),
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
