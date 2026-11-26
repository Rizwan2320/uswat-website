import { permanentRedirect } from 'next/navigation'

/* The university's old `dean-office` page is blank headings only (news, announcements, events, tenders, jobs). This address goes to /administration/office-of-the-deans. */
export default function Page() {
  return permanentRedirect('/administration/office-of-the-deans')
}
