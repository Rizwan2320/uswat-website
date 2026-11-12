import type { CollectionConfig, Field } from 'payload'
import { plainSlugField } from '@/fields/plainSlug'

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
  'meta',
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
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'The headline readers see.' },
        },
        plainSlugField(),
        {
          name: 'legacyUrl',
          label: 'Address on the old site',
          type: 'text',
          index: true,
          admin: {
            description:
              'The address of the page on the old site. Used to match records on re-import and to redirect.',
          },
        },
        {
          name: 'publishedAt',
          label: 'Date shown to readers',
          type: 'date',
          index: true,
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            position: 'sidebar',
            description:
              'The date printed on the item. It does not publish it; use "Go live on" under Ownership and approval for that.',
          },
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
          label: 'Text status',
          type: 'select',
          defaultValue: 'full',
          options: [
            { label: 'Full text', value: 'full' },
            { label: 'Placeholder (text still to be added)', value: 'stub' },
          ],
          admin: { position: 'sidebar' },
        },
        {
          name: 'excerpt',
          label: 'Short summary',
          type: 'textarea',
          localized: true,
          admin: { description: 'One or two sentences shown in lists.' },
        },
        {
          name: 'body',
          label: 'Main text',
          type: 'richText',
          localized: true,
          editor: lexicalEditor(),
        },
        {
          name: 'heroImage',
          label: 'Main image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'The large picture at the top. It needs alt text in the media library.',
          },
        },
        {
          name: 'attachments',
          type: 'array',
          admin: { description: 'PDFs and other files, added as links.' },
          fields: [
            {
              name: 'label',
              label: 'Link text',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description: 'Say what the file is, for example "Fee schedule 2026 (PDF)".',
              },
            },
            {
              name: 'url',
              label: 'Web address',
              type: 'text',
              required: true,
              validate: safeHrefValidate,
              admin: { description: 'Where the file is, starting with https://' },
            },
          ],
        },
        { name: 'tags', type: 'relationship', relationTo: 'article-tags', hasMany: true },
        {
          name: 'meta',
          label: 'Search and sharing',
          type: 'group',
          admin: {
            description:
              'How this appears in search results and when shared. Leave blank to use the title and excerpt.',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              maxLength: 70,
              admin: { description: 'Up to 70 characters.' },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              maxLength: 170,
              admin: { description: 'One or two sentences, up to 170 characters.' },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Shown when the page is shared. Needs alt text and recorded rights, like any image.',
              },
            },
          ],
        },
        ...(opts.extraFields ?? []),
      ],
    },
    [...COMMON_CONTENT, ...(opts.extraContentFields ?? [])],
    { expiryRequired: opts.expiryRequired },
  )
}
