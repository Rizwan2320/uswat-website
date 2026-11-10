import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { slugField } from 'payload'

import {
  documentsField,
  emailsField,
  governedCollection,
  legacyUrlField,
} from './governedCollection'

/**
 * Offices and boards. `governance.ownerOffice` stays a text that must match a user's offices
 * (ADR-0010); this collection is what the public pages show, not what access is decided from.
 */
export const Offices = governedCollection({
  slug: 'offices',
  singular: 'Office',
  plural: 'Offices',
  useAsTitle: 'name',
  group: 'Organisation',
  defaultColumns: ['name', 'group', 'updatedAt'],
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    slugField({ useAsSlug: 'name', position: undefined }),
    legacyUrlField,
    { name: 'group', type: 'text', admin: { description: 'For example "Directorates".' } },
    { name: 'text', type: 'richText', localized: true, editor: lexicalEditor() },
    { name: 'head', label: 'Head of office', type: 'relationship', relationTo: 'people' },
    { name: 'hours', type: 'text', localized: true },
    {
      name: 'phones',
      type: 'array',
      fields: [{ name: 'number', type: 'text', required: true }],
    },
    emailsField,
    documentsField,
  ],
  contentFields: [
    'name',
    'slug',
    'legacyUrl',
    'group',
    'text',
    'head',
    'hours',
    'phones',
    'emails',
    'documents',
  ],
})
