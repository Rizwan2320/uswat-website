import type { Field } from 'payload'

import { MetaImageField } from '@payloadcms/plugin-seo/fields'

import { MEDIA_MAX_BYTES } from '../governance/mediaRules'

/**
 * The SEO plugin's share-picture field with our own wording. The plugin's default help text
 * says "Maximum upload file size: 12MB", which is not our rule (the media library refuses
 * anything over MEDIA_MAX_BYTES), so an editor would be told the wrong limit.
 */
export function plainMetaImageField(relationTo = 'media'): Field {
  const base = MetaImageField({ relationTo })
  const mb = Math.round(MEDIA_MAX_BYTES / (1024 * 1024))
  return {
    ...base,
    label: 'Picture when shared',
    admin: {
      ...(base as { admin?: object }).admin,
      description: `Shown when the page is shared. JPEG, PNG, WebP or AVIF, up to ${mb} MB. Like any image it needs alt text and a recorded permission to use.`,
    },
  } as Field
}
