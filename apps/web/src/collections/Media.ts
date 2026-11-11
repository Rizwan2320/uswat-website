import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { mediaBeforeChange } from '../governance/mediaGuard'
import {
  MEDIA_MIME_TYPES,
  RIGHTS_LABELS,
  RIGHTS_STATUSES,
} from '../governance/mediaRules'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: { beforeChange: [mediaBeforeChange] },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description:
          'Describe what the image shows, for people who cannot see it. Required when a person uploads. Images brought in by the importer start empty and appear in the needs-alt list.',
      },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Photographer or source line shown with the image.' },
    },
    {
      name: 'rightsStatus',
      label: 'Rights',
      type: 'select',
      defaultValue: 'unknown',
      index: true,
      options: RIGHTS_STATUSES.map((value) => ({ value, label: RIGHTS_LABELS[value] })),
      admin: {
        description:
          'An image with unknown rights cannot appear on a published page. Only an approver or administrator can change this.',
      },
    },
    {
      name: 'sourceUrl',
      label: 'Source URL',
      type: 'text',
      admin: { description: 'Where the file came from (a URL or a named document).' },
    },
    {
      name: 'sourcePage',
      label: 'Source page',
      type: 'text',
      admin: { description: 'The page the image was found on, if it was imported.' },
    },
    {
      name: 'sha256',
      label: 'SHA-256',
      type: 'text',
      unique: true,
      admin: { readOnly: true, description: 'Set from the file. Used to stop duplicate uploads.' },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    mimeTypes: [...MEDIA_MIME_TYPES],
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
