import { permanentRedirect } from 'next/navigation'

/* The university's old `qec` page is blank headings only; the Quality Enhancement Cell has its own page. This address goes to /administration/quality-enhancement-cell. */
export default function Page() {
  return permanentRedirect('/administration/quality-enhancement-cell')
}
