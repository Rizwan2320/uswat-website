'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-[var(--radius)] border border-[rgb(0_59_23/0.07)] bg-card hover:cursor-pointer',
        'shadow-[0_12px_16px_-10px_rgb(0_42_16/0.34),0_3px_6px_rgb(0_42_16/0.07)] transition-transform duration-200 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className,
      )}
      ref={card.ref}
    >
      {metaImage && typeof metaImage !== 'string' && (
        <div className="relative w-full">
          <Media resource={metaImage} size="33vw" />
        </div>
      )}
      <div className="p-5">
        {showCategories && hasCategories && (
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--maroon)]">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category

                const categoryTitle = titleFromCategory || 'Untitled category'

                const isLast = index === categories.length - 1

                return (
                  <Fragment key={index}>
                    {categoryTitle}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }

              return null
            })}
          </div>
        )}
        {titleToUse && (
          <h2 className="font-[family-name:var(--stack-serif)] text-xl font-semibold leading-snug text-primary">
            <Link className="no-underline hover:underline focus-visible:underline" href={href} ref={link.ref}>
              {titleToUse}
            </Link>
          </h2>
        )}
        {description && <p className="mt-2 text-[0.95rem]">{sanitizedDescription}</p>}
      </div>
    </article>
  )
}
