import { permanentRedirect } from 'next/navigation'

/* The university's old `directorate-of-advance-studies-and-research` page is a duplicate of the DASR page that says it will be updated soon. This address goes to /administration/advanced-studies-and-research-board. */
export default function Page() {
  return permanentRedirect('/administration/advanced-studies-and-research-board')
}
