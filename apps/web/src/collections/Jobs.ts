import { postType } from './postTypes'

/** The closing date is the governance `expireAt`; a job cannot leave Draft without one (LIF-04). */
export const Jobs = postType({
  slug: 'jobs',
  singular: 'Job',
  plural: 'Jobs',
  expiryRequired: true,
})
