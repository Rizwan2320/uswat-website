import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import {
  governedCreate,
  governedDelete,
  governedRead,
  governedReadVersions,
  governedUpdate,
} from '../governance/access'
import { withGovernance } from '../governance/fields'

/** Tags for posts: the old site's extra categories become tags (Addendum 8, rule 1). */
export const ArticleTags: CollectionConfig = withGovernance(
  {
    slug: 'article-tags',
    labels: { singular: 'Article tag', plural: 'Article tags' },
    admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'updatedAt'], group: 'Content' },
    access: {
      create: governedCreate,
      delete: governedDelete,
      read: governedRead,
      readVersions: governedReadVersions,
      update: governedUpdate,
    },
    versions: { drafts: { autosave: { interval: 1000 } }, maxPerDoc: 25 },
    fields: [
      { name: 'name', type: 'text', required: true, localized: true },
      slugField({ useAsSlug: 'name', position: undefined }),
      {
        name: 'aliases',
        type: 'array',
        admin: {
          description: 'Other words people search for (for example "CS" for Computer Science).',
        },
        fields: [{ name: 'alias', type: 'text', required: true }],
      },
    ],
  },
  ['name', 'slug', 'aliases'],
)
