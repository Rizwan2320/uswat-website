import React from 'react'

import type { CardPostData } from '@/components/Card'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import PageHeader from '@/site/components/kit/PageHeader'
import Pagination from '@/site/components/kit/Pagination'

export const POSTS_PER_PAGE = 12

const hrefFor = (n: number) => (n === 1 ? '/posts' : `/posts/page/${n}`)

/* Shared by /posts and /posts/page/N: one header, the stock cards, the kit pagination (plain links). */
type Listing = { docs: CardPostData[]; page?: number; totalDocs: number; totalPages: number }

export default function PostsPage({ posts }: { posts: Listing }) {
  return (
    <>
      <PageHeader title="News" crumbs={[{ label: 'Home', href: '/' }, { label: 'News' }]} />
      <div className="pt-10 pb-16">
        <div className="container mb-8">
          <PageRange
            collection="posts"
            currentPage={posts.page}
            limit={POSTS_PER_PAGE}
            totalDocs={posts.totalDocs}
          />
        </div>
        {posts.totalDocs > 0 ? (
          <CollectionArchive posts={posts.docs} />
        ) : (
          <p className="container">There are no published news items yet.</p>
        )}
        <div className="container">
          {posts.page ? (
            <Pagination page={posts.page} pageCount={posts.totalPages} hrefFor={hrefFor} />
          ) : null}
        </div>
      </div>
    </>
  )
}
