import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import {
  governedCreate,
  governedDelete,
  governedRead,
  governedReadVersions,
  governedUpdate,
} from '../../governance/access'
import { withGovernance } from '../../governance/fields'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { plainMetaImageField } from '@/fields/plainMetaImage'
import { plainSlugField } from '@/fields/plainSlug'

export const Posts: CollectionConfig<'posts'> = withGovernance(
  {
    slug: 'posts',
    access: {
      create: governedCreate,
      delete: governedDelete,
      read: governedRead,
      readVersions: governedReadVersions,
      update: governedUpdate,
    },
    // This config controls what's populated by default when a post is referenced
    // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
    // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
    defaultPopulate: {
      title: true,
      slug: true,
      categories: true,
      meta: {
        image: true,
        description: true,
      },
    },
    admin: {
      group: 'Content',
      defaultColumns: ['title', 'slug', 'updatedAt'],
      livePreview: {
        url: ({ data, req }) =>
          generatePreviewPath({
            slug: data?.slug,
            collection: 'posts',
            req,
          }),
      },
      preview: (data, { req }) =>
        generatePreviewPath({
          slug: data?.slug as string,
          collection: 'posts',
          req,
        }),
      useAsTitle: 'title',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      {
        type: 'tabs',
        tabs: [
          {
            fields: [
              {
                name: 'heroImage',
                label: 'Main image',
                type: 'upload',
                relationTo: 'media',
              },
              {
                name: 'content',
                type: 'richText',
                editor: lexicalEditor({
                  features: ({ rootFeatures }) => {
                    return [
                      ...rootFeatures,
                      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                      BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                      FixedToolbarFeature(),
                      InlineToolbarFeature(),
                      HorizontalRuleFeature(),
                    ]
                  },
                }),
                label: false,
                required: true,
              },
            ],
            label: 'Content',
          },
          {
            fields: [
              {
                name: 'relatedPosts',
                label: 'Related posts',
                type: 'relationship',
                admin: {
                  description: 'Other posts readers may want next.',
                  position: 'sidebar',
                },
                filterOptions: ({ id }) => {
                  return {
                    id: {
                      not_in: [id],
                    },
                  }
                },
                hasMany: true,
                relationTo: 'posts',
              },
              {
                name: 'categories',
                type: 'relationship',
                admin: {
                  position: 'sidebar',
                },
                hasMany: true,
                relationTo: 'categories',
              },
              {
                name: 'tags',
                type: 'relationship',
                admin: {
                  position: 'sidebar',
                  description:
                    'Secondary topics. The first category is the main type; other old categories become tags.',
                },
                hasMany: true,
                relationTo: 'article-tags',
              },
            ],
            label: 'Details',
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
            'The date printed on the post. It does not publish it; use "Go live on" under Ownership and approval for that.',
          date: {
            pickerAppearance: 'dayAndTime',
          },
          position: 'sidebar',
        },
        hooks: {
          beforeChange: [
            ({ siblingData, value }) => {
              if (siblingData._status === 'published' && !value) {
                return new Date()
              }
              return value
            },
          ],
        },
      },
      {
        name: 'authors',
        type: 'relationship',
        admin: {
          position: 'sidebar',
        },
        hasMany: true,
        relationTo: 'users',
      },
      // This field is only used to populate the user data via the `populateAuthors` hook
      // This is because the `user` collection has access control locked to protect user privacy
      // GraphQL will also not return mutated user data that differs from the underlying schema
      {
        name: 'populatedAuthors',
        type: 'array',
        access: {
          update: () => false,
        },
        admin: {
          disabled: true,
          readOnly: true,
        },
        fields: [
          {
            name: 'id',
            type: 'text',
          },
          {
            name: 'name',
            type: 'text',
          },
        ],
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
      plainSlugField(),
    ],
    hooks: {
      afterChange: [revalidatePost],
      afterRead: [populateAuthors],
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
  [
    'title',
    'heroImage',
    'content',
    'relatedPosts',
    'categories',
    'tags',
    'meta',
    'authors',
    'slug',
    'bodyStatus',
  ],
)
