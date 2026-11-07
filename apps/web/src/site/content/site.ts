import type { Provenance } from './types'

const VERIFIED_AT = '2026-11-06' // crawl date of the public site

export const site = {
  name: 'University of Swat',
  nameCaps: 'UNIVERSITY OF SWAT',
  /** Replaces the mockup's "Striving for Academic Excellence" (user decision, 2026-11-07). */
  tagline: 'Aspiring for Quality Education with Relevance',
  /** Small line under the name in the header logo (the tagline itself is in the top bar, hero and footer).
   *  Source: https://uswat.edu.pk/ home page, "established in the year 2010", crawled 2026-11-06. */
  logoLine: 'Established 2010',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://uswat-website.vercel.app',
  /** Address as drawn in the mockup. The public site names Charbagh for the main campus, so this one is unconfirmed. */
  address: {
    line: 'C.T. Road, Odigram, Swat, Pakistan',
    footerLine: 'C.T. Road, Odigram, Swat, Khyber Pakhtunkhwa, Pakistan',
    // TODO(content): Odigram (mockup) vs Charbagh (https://uswat.edu.pk/category/latestnews/page/19/) is an open conflict.
    sample: true,
  } satisfies { line: string; footerLine: string } & Provenance,
  /** PS to the Vice Chancellor landline, from https://uswat.edu.pk/vc-office/ . The mockup's number is not used. */
  phone: {
    display: '0946-730510',
    tel: '+92946730510',
    note: 'Office of the Vice Chancellor',
    source: 'https://uswat.edu.pk/vc-office/',
    verifiedAt: VERIFIED_AT,
  },
  /** Website contact shown on the public home page. */
  email: {
    address: 'webmaster@uswat.edu.pk',
    source: 'https://uswat.edu.pk/',
    verifiedAt: VERIFIED_AT,
  },
  social: [
    { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/universityofswat/' },
    { id: 'youtube', label: 'Campus TV on YouTube', href: 'https://www.youtube.com/@Campus_Tv_UoS' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/university-of-swat1/' },
    { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@universityofswat2010' },
  ],
  /** Swat valley, used for the map link only. TODO(content): replace with the verified campus pin. */
  mapHref: 'https://www.openstreetmap.org/search?query=University%20of%20Swat',
  portalLinks: {
    student: 'https://cms1.uswat.edu.pk/web/login',
    faculty: 'https://cms1.uswat.edu.pk/web/login', // TODO(content): confirm whether faculty use a separate login
  },
} as const
