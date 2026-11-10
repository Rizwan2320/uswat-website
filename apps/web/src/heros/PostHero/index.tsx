import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import PageHeader from '@/site/components/kit/PageHeader'
import { formatAuthors } from '@/utilities/formatAuthors'

/* Post title band (the kit's PageHeader) with category, author and date, then the hero image if there is one. */
export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''
  const categoryNames = (categories ?? [])
    .map((c) => (typeof c === 'object' && c !== null ? c.title || 'Untitled category' : null))
    .filter(Boolean)
    .join(', ')

  return (
    <>
      <PageHeader
        title={title}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'News', href: '/posts' }, { label: title }]}
      >
        {categoryNames || hasAuthors || publishedAt ? (
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm opacity-90">
            {categoryNames ? <span className="font-semibold uppercase tracking-wide">{categoryNames}</span> : null}
            {hasAuthors ? <span>By {formatAuthors(populatedAuthors)}</span> : null}
            {publishedAt ? <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time> : null}
          </p>
        ) : null}
      </PageHeader>
      {heroImage && typeof heroImage !== 'string' ? (
        <div className="container mt-8">
          <div className="mx-auto max-w-[56rem] overflow-hidden rounded-[var(--radius)]">
            <Media priority resource={heroImage} />
          </div>
        </div>
      ) : null}
    </>
  )
}
