import { homeEvents, homeFeeds, homeNews } from '../home/cms'
import { readHomeContent } from '../home/homeContent'
import { toAdmissions, toFooter, toHeroContent, toTopBar, toHeroSlides, toLeadership, toPortals, toStats } from '../home/homeMap'
import { admissions } from '../content/admissions'
import { events } from '../content/events'
import { feeds } from '../content/feeds'
import { hero, heroSlides } from '../content/hero'
import { images } from '../content/images'
import { leadership } from '../content/leadership'
import { footerQuick, footerUseful, nav } from '../content/nav'
import { news } from '../content/news'
import { portals } from '../content/portals'
import { site } from '../content/site'
import { stats } from '../content/stats'

/* Async getters over content/*. Notices, jobs, tenders, news and events come from published CMS records when there are any
   (home/cms.ts) and otherwise from the sourced files; slider photographs and statistics come from the published `home-content` global when it is complete (home/homeMap.ts); the rest still return the typed files. */
export async function getSite() { return site }
export async function getNav() { return nav }
export async function getTopBar() {
  return toTopBar(await readHomeContent(), {
    place: 'Swat, Khyber Pakhtunkhwa, Pakistan',
    established: site.established,
    studentUrl: site.portalLinks.student,
    facultyUrl: site.portalLinks.faculty,
  })
}
export async function getFooter() {
  return toFooter(await readHomeContent(), {
    tagline: site.tagline,
    address: site.address,
    phone: { display: site.phone.display, tel: site.phone.tel, note: site.phone.note },
    email: site.email.address,
    social: site.social,
    mapHref: site.mapHref,
    quick: footerQuick,
    useful: footerUseful,
  })
}
export async function getHero() {
  const doc = await readHomeContent()
  return { content: toHeroContent(doc, hero), slides: toHeroSlides(doc, heroSlides) }
}
export async function getStats() { return toStats(await readHomeContent(), stats) }
export async function getHomeColours() { return (await readHomeContent())?.colours ?? null }
export async function getLeadership() { return toLeadership(await readHomeContent(), leadership, images.vc) }
export async function getAdmissions() { return toAdmissions(await readHomeContent(), admissions) }
export async function getPortals() { return toPortals(await readHomeContent(), portals) }
export async function getFeeds() { return homeFeeds(feeds) }
export async function getNews() { return homeNews(news) }
export async function getEvents() { return homeEvents(events) }
