import { postType } from './postTypes'

/** The closing date is the governance `expireAt`; a tender cannot leave Draft without one (LIF-04). */
export const Tenders = postType({
  slug: 'tenders',
  singular: 'Tender',
  plural: 'Tenders',
  expiryRequired: true,
})
