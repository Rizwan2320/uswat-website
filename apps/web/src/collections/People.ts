import { plainSlugField } from '@/fields/plainSlug'

import { safeHrefValidate } from '../governance/fields'
import { visibleWhenPublic } from '../governance/privacy'
import { governedCollection } from './governedCollection'

const VISIBILITY = [
  { label: 'Hidden', value: 'hidden' },
  { label: 'Staff only', value: 'internal' },
  { label: 'Public', value: 'public' },
]

/**
 * People are directory entries, not pages (Addendum 5.5). Each personal field has its own
 * visibility, hidden by default, so an imported address is never public until a person says so
 * (Addendum C FP-06; FP reply 2026-11-10). The rule is enforced as field access in
 * governance/privacy.ts, so it holds for every public read, including populated relationships.
 *
 * Not here yet, by agreement with the faculty portal agent: `claimedBy`, the `faculty` origin,
 * on-behalf-of auditing. They arrive in a small migration if the portal gate passes.
 */
export const People = governedCollection({
  slug: 'people',
  singular: 'Person',
  plural: 'People',
  useAsTitle: 'name',
  group: 'Organisation',
  defaultColumns: ['name', 'designation', 'department', 'facultyStatus', 'updatedAt'],
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    plainSlugField({ useAsSlug: 'name', position: undefined }),
    { name: 'designation', type: 'text', localized: true },
    { name: 'department', type: 'relationship', relationTo: 'departments' },
    { name: 'office', type: 'relationship', relationTo: 'offices' },
    { name: 'details', type: 'textarea', localized: true },
    {
      name: 'email',
      type: 'email',
      access: { read: visibleWhenPublic('email') },
      admin: { description: 'Shown publicly only when its visibility is Public.' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      access: { read: visibleWhenPublic('photo') },
    },
    { name: 'cvLink', label: 'CV link', type: 'text', validate: safeHrefValidate },
    {
      name: 'publications',
      type: 'array',
      fields: [
        { name: 'title', label: 'Title of the publication', type: 'text', required: true },
        { name: 'url', label: 'Web address', type: 'text', validate: safeHrefValidate },
      ],
    },
    {
      name: 'facultyStatus',
      label: 'Status',
      type: 'select',
      defaultValue: 'current',
      options: [
        { label: 'Current', value: 'current' },
        { label: 'Former', value: 'former' },
        { label: 'Emeritus', value: 'emeritus' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'visibility',
      type: 'group',
      admin: { description: 'Who may see each personal detail. Hidden unless set otherwise.' },
      fields: [
        { name: 'email', type: 'select', defaultValue: 'hidden', options: VISIBILITY },
        { name: 'photo', type: 'select', defaultValue: 'hidden', options: VISIBILITY },
      ],
    },
  ],
  contentFields: [
    'name',
    'slug',
    'designation',
    'department',
    'office',
    'details',
    'email',
    'photo',
    'cvLink',
    'publications',
    'facultyStatus',
    'visibility',
  ],
})
