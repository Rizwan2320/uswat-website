import { homeEvents, homeFeeds, homeNews } from '../home/cms'
import { readHomeContent } from '../home/homeContent'
import { toHeroSlides, toStats } from '../home/homeMap'
import { admissions } from '../content/admissions'
import { events } from '../content/events'
import { feeds } from '../content/feeds'
import { hero, heroSlides } from '../content/hero'
import { leadership } from '../content/leadership'
import { nav } from '../content/nav'
import { news } from '../content/news'
import { portals } from '../content/portals'
import { site } from '../content/site'
import { stats } from '../content/stats'

/* Async getters over content/*. Notices, jobs, tenders, news and events come from published CMS records when there are any
   (home/cms.ts) and otherwise from the sourced files; slider photographs and statistics come from the published `home-content` global when it is complete (home/homeMap.ts); the rest still return the typed files. */
export async function getSite() { return site }
export async function getNav() { return nav }
export async function getHero() { return { content: hero, slides: toHeroSlides(await readHomeContent(), heroSlides) } }
export async function getStats() { return toStats(await readHomeContent(), stats) }
export async function getHomeColours() { return (await readHomeContent())?.colours ?? null }
export async function getLeadership() { return leadership }
export async function getAdmissions() { return admissions }
export async function getPortals() { return portals }
export async function getFeeds() { return homeFeeds(feeds) }
export async function getNews() { return homeNews(news) }
export async function getEvents() { return homeEvents(events) }
