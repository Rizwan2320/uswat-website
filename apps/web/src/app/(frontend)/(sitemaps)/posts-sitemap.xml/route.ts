import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

import { toEntries } from '@/site/sitemap/entries'
import { getServerSideURL } from '@/utilities/getURL'

const getPostsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const results = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        governance: { source: true },
      },
    })

    // News is served at /news/{slug}; the old stock path /posts/{slug} is not a public address.
    const sitemap = toEntries(
      getServerSideURL(),
      '/news',
      (results.docs ?? []) as unknown as Record<string, unknown>[],
      new Date().toISOString(),
    )

    return sitemap
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  return getServerSideSitemap(sitemap)
}
