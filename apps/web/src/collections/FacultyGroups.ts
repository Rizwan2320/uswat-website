import { slugField } from 'payload'

import { governedCollection } from './governedCollection'

/**
 * Called "Faculty groups" in the editor-facing text so it is not confused with faculty members
 * (Addendum 7.2). The slug stays `faculties` as in the plan. Member departments are not stored
 * here: each Department points to its group, so there is one place to change.
 */
export const FacultyGroups = governedCollection({
  slug: 'faculties',
  singular: 'Faculty group',
  plural: 'Faculty groups',
  useAsTitle: 'name',
  group: 'Organisation',
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    slugField({ useAsSlug: 'name', position: undefined }),
    {
      name: 'legacyKey',
      label: 'Old menu label',
      type: 'text',
      index: true,
      admin: { description: 'The label on the old site menu. Used to match records on re-import.' },
    },
  ],
  contentFields: ['name', 'slug', 'legacyKey'],
})
