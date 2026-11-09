import { admissions } from '../content/admissions'
import { formatDate } from './dates'

export type AdmissionsState = {
  open: boolean
  headline: string
  detail: string
  ctaLabel: string
  ctaHref: string
}

/* Called from a Server Component. The home page sets `revalidate = 3600`, so the state flips within an hour of the deadline. */
export function getAdmissionsState(now: Date = new Date()): AdmissionsState {
  const open = now.getTime() <= new Date(admissions.deadlineISO).getTime()
  return open
    ? {
        open,
        headline: `Admissions Open – ${admissions.session}`,
        // A single separator (the mockup had "| |").
        detail: `Apply Online | Last Date: ${formatDate(admissions.deadlineISO)}`,
        ctaLabel: 'Apply Online',
        ctaHref: admissions.applyUrl,
      }
    : {
        open,
        headline: `Admissions ${admissions.session} Closed`,
        detail: admissions.closedDetail,
        ctaLabel: 'View Admissions',
        ctaHref: admissions.closedUrl,
      }
}
