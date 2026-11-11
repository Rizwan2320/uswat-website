import type { CollectionConfig, Field } from 'payload'
import { slugField } from 'payload'

import { lexicalEditor } from '@payloadcms/richtext-lexical'

import {
  governedCreate,
  governedDelete,
  governedRead,
  governedReadVersions,
  governedUpdate,
} from '../governance/access'
import { safeHrefValidate, withGovernance } from '../governance/fields'

/**
 * The announcement-style post types: Notices, Events, Jobs, Tenders (Addendum 7.2, 8). News is the
 * existing `posts` collection for now (see docs/briefs/p3d-post-types.md).
 *
 * Fields come from the Addendum field-mapping table: title, publish date, tags, excerpt, body,
 * images, owner office (the governance group), closing date (the governance `expireAt`), and the
 * attached PDFs as links. Nothing else is invented, except the event start date, because an
 * event without a start is not an event.
 */
export interface PostTypeOptions {
  slug: string
  singular: string
  plural: string
  /** Jobs, Tenders and Events must have an expiry before they leave Draft (LIF-04). */
  expiryRequired?: boolean
  extraFields?: Field[]
  /** Names of `extraFields` whose change counts as a content edit. */
  extraContentFields?: string[]
}

const COMMON_CONTENT = [
  'title',
  'slug',
  'legacyUrl',
  'excerpt',
  'body',
  'bodyStatus',
  'heroImage',
  'attachments',
  'tags',
]

export function postType(opts: PostTypeOptions): CollectionConfig {
  return withGovernance(
    {
      slug: opts.slug,
      labels: { singular: opts.singular, plural: opts.plural },
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'publishedAt', 'updatedAt'],
        group: 'Announcements',
      },
      access: {
        create: governedCreate,
        delete: governedDelete,
        read: governedRead,
        readVersions: governedReadVersions,
        update: governedUpdate,
      },
      versions: { drafts: { autosave: { interval: 1000 } }, maxPerDoc: 25 },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        slugField(),
        {
          name: 'legacyUrl',
          label: 'Old page URL',
          type: 'text',
          index: true,
          admin: {
            description:
              'The address of the page on the old site. Used to match records on re-import and to redirect.',
          },
        },
        {
          name: 'publishedAt',
          label: 'Publish date',
          type: 'date',
          index: true,
          admin: { date: { pickerAppearance: 'dayAndTime' }, position: 'sidebar' },
          hooks: {
            beforeChange: [
              // A published record always has a date: current lists and the 90-day age-out use it.
              ({ siblingData, value }) =>
                siblingData._status === 'published' && !value ? new Date() : value,
            ],
          },
        },
        {
          name: 'bodyStatus',
          label: 'Body',
          type: 'select',
          defaultValue: 'full',
          options: [
            { label: 'Full text', value: 'full' },
            { label: 'Stub (text not collected yet)', value: 'stub' },
          ],
          admin: { position: 'sidebar' },
        },
        { name: 'excerpt', type: 'textarea', localized: true },
        { name: 'body', type: 'richText', localized: true, editor: lexicalEditor() },
        { name: 'heroImage', type: 'upload', relationTo: 'media' },
        {
          name: 'attachments',
          type: 'array',
          admin: { description: 'PDFs and other files, as links.' },
          fields: [
            { name: 'label', type: 'text', required: true, localized: true },
            { name: 'url', type: 'text', required: true, validate: safeHrefValidate },
          ],
        },
        { name: 'tags', type: 'relationship', relationTo: 'article-tags', hasMany: true },
        ...(opts.extraFields ?? []),
      ],
    },
    [...COMMON_CONTENT, ...(opts.extraContentFields ?? [])],
    { expiryRequired: opts.expiryRequired },
  )
}
