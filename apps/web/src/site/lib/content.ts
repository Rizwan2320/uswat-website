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

/* Async getters over content/*. Today they return the typed files; later they can call the Payload CMS
   (local API) with no component changes. */
export async function getSite() { return site }
export async function getNav() { return nav }
export async function getHero() { return { content: hero, slides: heroSlides } }
export async function getStats() { return stats }
export async function getLeadership() { return leadership }
export async function getAdmissions() { return admissions }
export async function getPortals() { return portals }
export async function getFeeds() { return feeds }
export async function getNews() { return news }
export async function getEvents() { return events }
