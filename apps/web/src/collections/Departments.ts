import { plainSlugField } from '@/fields/plainSlug'

import {
  documentsField,
  emailsField,
  governedCollection,
  legacyUrlField,
} from './governedCollection'

/** Department belongs to a faculty group; the head is a person (a human supplies it, Addendum 8). */
export const Departments = governedCollection({
  slug: 'departments',
  singular: 'Department',
  plural: 'Departments',
  useAsTitle: 'name',
  group: 'Organisation',
  defaultColumns: ['name', 'facultyGroup', 'updatedAt'],
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    plainSlugField({ useAsSlug: 'name', position: undefined }),
    legacyUrlField,
    { name: 'facultyGroup', label: 'Faculty group', type: 'relationship', relationTo: 'faculties' },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'vision', type: 'textarea', localized: true },
    { name: 'mission', type: 'textarea', localized: true },
    { name: 'head', label: 'Head of department', type: 'relationship', relationTo: 'people' },
    documentsField,
    emailsField,
  ],
  contentFields: [
    'name',
    'slug',
    'legacyUrl',
    'facultyGroup',
    'summary',
    'vision',
    'mission',
    'head',
    'documents',
    'emails',
  ],
})
