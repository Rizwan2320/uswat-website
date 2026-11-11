import { postType } from './postTypes'

/**
 * `expireAt` is when the event ends; a past event is archived, not "upcoming" (Addendum 8) and
 * an event cannot leave Draft without it (LIF-04).
 */
export const Events = postType({
  slug: 'events',
  singular: 'Event',
  plural: 'Events',
  expiryRequired: true,
  extraFields: [
    {
      name: 'startsAt',
      label: 'Starts',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'venue', type: 'text', localized: true },
  ],
  extraContentFields: ['startsAt', 'venue'],
})
