import AdmissionsBanner from '@/site/components/AdmissionsBanner'
import AlumniShowcase from '@/site/components/AlumniShowcase'
import FeedCards from '@/site/components/FeedCards'
import Hero from '@/site/components/Hero'
import LeadershipMessage from '@/site/components/LeadershipMessage'
import NewsEvents from '@/site/components/NewsEvents'
import PortalsGrid from '@/site/components/PortalsGrid'
import StatsCard from '@/site/components/StatsCard'
import { paletteCss, paletteMessage, usableColours } from '@/governance/homePalette'
import { site } from '@/site/content/site'
import { getHomeColours } from '@/site/lib/content'

// The admissions open/closed state and "upcoming" events are decided on the server from the clock, so refresh every five minutes (the same bound as the CMS lists it reads).
export const revalidate = 300

export default async function HomePage() {
  // The three colours an editor may change for this page only. Only valid #rrggbb values get this far, and a
  // choice that fails the reading-contrast rules is ignored even if it somehow reached the database.
  const chosen = usableColours(await getHomeColours())
  const colourCss = paletteMessage(chosen) ? null : paletteCss(chosen)
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {colourCss ? (
        <style data-home-colours dangerouslySetInnerHTML={{ __html: colourCss }} />
      ) : null}
      <Hero />
      <StatsCard />
      <LeadershipMessage />
      <AdmissionsBanner />
      <PortalsGrid />
      <FeedCards />
      <NewsEvents />
      <AlumniShowcase />
    </>
  )
}
