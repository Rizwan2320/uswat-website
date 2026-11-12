import { slugField } from 'payload'

type SlugOptions = NonNullable<Parameters<typeof slugField>[0]>

/**
 * Payload's slug field with wording an office editor can follow. "Slug" is web-developer
 * language. The behaviour is unchanged: the address ending is made from the title until
 * someone edits it by hand.
 */
export const plainSlugField = (options: SlugOptions = {}) =>
  slugField({
    ...options,
    overrides: (field) => {
      const row = options.overrides ? options.overrides(field) : field
      const [auto, slug] = row.fields as unknown as Array<Record<string, unknown>>
      if (auto) {
        auto.label = 'Make the address from the title'
        auto.admin = {
          ...(auto.admin as object),
          description:
            'Leave ticked and the address follows the title. Untick it to type your own.',
        }
      }
      if (slug) {
        slug.label = 'Web address ending'
        slug.admin = {
          ...(slug.admin as object),
          description:
            'The last part of this page’s web address, for example "admission-notice". Use lower-case words joined by dashes.',
        }
      }
      return row
    },
  })
