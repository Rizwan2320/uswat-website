import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { hiddenFromEditors } from '@/governance/adminMenu'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | University of Swat` : 'University of Swat'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

/** Public content that can be a redirect target. */
export const REDIRECT_TARGETS = ['pages', 'posts', 'notices', 'events', 'jobs', 'tenders']
/** Public content that appears in site search (FR-09). People and offices are left out until P5 decides. */
export const SEARCH_COLLECTIONS = ['pages', 'posts', 'notices', 'events', 'jobs', 'tenders']

export const plugins: Plugin[] = [
  redirectsPlugin({
    // Every public content type that can be the target of an old address (MIG-02).
    collections: REDIRECT_TARGETS,
    overrides: {
      admin: { hidden: hiddenFromEditors },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
    // Plain wording for the picture shown when a page is shared.
    fields: ({ defaultFields }) =>
      defaultFields.map((field) =>
        'name' in field && field.name === 'image'
          ? { ...field, label: 'Picture when shared' }
          : field,
      ),
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: { admin: { hidden: hiddenFromEditors } },
    formOverrides: {
      admin: { hidden: hiddenFromEditors },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    // Drafts are not synced and unpublishing deletes the entry (plugin defaults, tested).
    collections: SEARCH_COLLECTIONS,
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: { hidden: hiddenFromEditors },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
