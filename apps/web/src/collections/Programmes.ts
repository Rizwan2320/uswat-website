import { plainSlugField } from '@/fields/plainSlug'

import { safeHrefValidate } from '../governance/fields'
import { governedCollection, legacyUrlField } from './governedCollection'

/**
 * Programme belongs to a department. Level, duration, eligibility, the fee link and the apply link are
 * filled by a person (Addendum 8). `level` is free text until the university supplies the list of levels.
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
    { name: 'curriculumUrl', label: 'Curriculum PDF', type: 'text', validate: safeHrefValidate },
    { name: 'feeLink', label: 'Fee information link', type: 'text', validate: safeHrefValidate },
    {
      name: 'applyUrl',
      label: 'Apply link',
      type: 'text',
      validate: safeHrefValidate,
      admin: {
        description:
          'Where applicants start their application (the admissions portal page for this programme). Leave empty to hide the Apply button.',
      },
    },
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
    'applyUrl',
  ],
})
