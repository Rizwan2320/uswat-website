import { plainSlugField } from '@/fields/plainSlug'

import { governedCollection, legacyUrlField } from './governedCollection'

/**
 * Programme belongs to a department. Level, duration, eligibility and the fee link are filled by
 * a person (Addendum 8). `level` is free text until the university supplies the list of levels.
 */
export const Programmes = governedCollection({
  slug: 'programmes',
  singular: 'Programme',
  plural: 'Programmes',
  useAsTitle: 'name',
  group: 'Organisation',
  defaultColumns: ['name', 'department', 'campus', 'updatedAt'],
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    plainSlugField({ useAsSlug: 'name', position: undefined }),
    legacyUrlField,
    { name: 'department', type: 'relationship', relationTo: 'departments' },
    { name: 'campus', type: 'relationship', relationTo: 'campuses' },
    { name: 'level', type: 'text' },
    { name: 'duration', type: 'text', localized: true },
    { name: 'eligibility', type: 'textarea', localized: true },
    { name: 'curriculumUrl', label: 'Curriculum PDF', type: 'text' },
    { name: 'feeLink', label: 'Fee information link', type: 'text' },
  ],
  contentFields: [
    'name',
    'slug',
    'legacyUrl',
    'department',
    'campus',
    'level',
    'duration',
    'eligibility',
    'curriculumUrl',
    'feeLink',
  ],
})
