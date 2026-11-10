import Link from 'next/link'

import PageHeader from '@/site/components/kit/PageHeader'

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" crumbs={[{ label: 'Home', href: '/' }, { label: 'Page not found' }]} />
      <section className="section">
        <div className="container">
          <p style={{ maxWidth: '60ch', marginBottom: 24 }}>
            This page does not exist or has moved. Check the address, or start again from the home page.
          </p>
          <Link className="btn btn--forest" href="/">
            Go to the home page
          </Link>
        </div>
      </section>
    </>
  )
}
