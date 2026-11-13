import { plainSlugField } from '@/fields/plainSlug'

import { governedCollection } from './governedCollection'

/**
 * Addresses are official but disputed between sources (Odigram or Charbagh, plan 4.8), so none is
 * seeded here: the Registrar decides, a person enters it, and `source` says where it came from.
 */
export const Campuses = governedCollection({
  slug: 'campuses',
  singular: 'Campus',
  plural: 'Campuses',
  useAsTitle: 'name',
  group: 'Organisation',
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    plainSlugField({ useAsSlug: 'name', position: undefined }),
    { name: 'address', type: 'textarea', localized: true },
    { name: 'link', type: 'text', admin: { description: 'A web page or map link.' } },
  ],
  contentFields: ['name', 'slug', 'address', 'link'],
})
