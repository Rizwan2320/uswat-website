import AdmissionsBanner from '@/site/components/AdmissionsBanner'
import FeedCards from '@/site/components/FeedCards'
import Hero from '@/site/components/Hero'
import LeadershipMessage from '@/site/components/LeadershipMessage'
import NewsEvents from '@/site/components/NewsEvents'
import PortalsGrid from '@/site/components/PortalsGrid'
import StatsCard from '@/site/components/StatsCard'
import { site } from '@/site/content/site'

// The admissions open/closed state and "upcoming" events are decided on the server from the clock, so refresh hourly.
export const revalidate = 3600

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: site.name,
    url: site.url,
    slogan: site.tagline,
    telephone: site.phone.tel,
    sameAs: site.social.map((s) => s.href),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <StatsCard />
      <LeadershipMessage />
      <AdmissionsBanner />
      <PortalsGrid />
      <FeedCards />
      <NewsEvents />
    </>
  )
}
