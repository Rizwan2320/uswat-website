import type { CollectionConfig } from 'payload'

import {
  governedCreate,
  governedDelete,
  governedRead,
  governedReadVersions,
  governedUpdate,
} from '../../governance/access'
import { withGovernance } from '../../governance/fields'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { plainMetaImageField } from '@/fields/plainMetaImage'
import { plainSlugField } from '@/fields/plainSlug'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = withGovernance(
  {
    slug: 'pages',
    access: {
      create: governedCreate,
      delete: governedDelete,
      read: governedRead,
      readVersions: governedReadVersions,
      update: governedUpdate,
    },
    // This config controls what's populated by default when a page is referenced
    // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
    // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
    defaultPopulate: {
      title: true,
      slug: true,
    },
    admin: {
      group: 'Content',
      defaultColumns: ['title', 'slug', 'updatedAt'],
      livePreview: {
        url: ({ data, req }) =>
          generatePreviewPath({
            slug: data?.slug,
            collection: 'pages',
            req,
          }),
      },
      preview: (data, { req }) =>
        generatePreviewPath({
          slug: data?.slug as string,
          collection: 'pages',
          req,
        }),
      useAsTitle: 'title',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        localized: true,
      },
      {
        type: 'tabs',
        tabs: [
          {
            fields: [hero],
            label: 'Hero',
          },
          {
            fields: [
              {
                name: 'layout',
                type: 'blocks',
                blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
                required: true,
                admin: {
                  initCollapsed: true,
                },
              },
            ],
            label: 'Content',
          },
          {
            name: 'meta',
            label: 'Search and sharing',
            fields: [
              OverviewField({
                titlePath: 'meta.title',
                descriptionPath: 'meta.description',
                imagePath: 'meta.image',
              }),
              MetaTitleField({
                hasGenerateFn: true,
              }),
              plainMetaImageField(),

              MetaDescriptionField({}),
              PreviewField({
                // if the `generateUrl` function is configured
                hasGenerateFn: true,

                // field paths to match the target field for data
                titlePath: 'meta.title',
                descriptionPath: 'meta.description',
              }),
            ],
          },
        ],
      },
      {
        name: 'publishedAt',
        label: 'Date shown to readers',
        type: 'date',
        admin: {
          description:
            'The date printed on the page. It does not publish it; use "Go live on" under Ownership and approval for that.',
          position: 'sidebar',
        },
      },
      plainSlugField(),
    ],
    hooks: {
      afterChange: [revalidatePage],
      beforeChange: [populatePublishedAt],
      afterDelete: [revalidateDelete],
    },
    versions: {
      drafts: {
        autosave: {
          interval: 100, // We set this interval for optimal live preview
        },
        schedulePublish: true,
      },
      maxPerDoc: 50,
    },
  },
  // Fields whose change counts as a content edit (governance/hooks.ts).
  ['title', 'hero', 'layout', 'meta', 'slug'],
)
