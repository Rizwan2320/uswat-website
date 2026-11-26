import { permanentRedirect } from 'next/navigation'

/* The university's old `digital-library` page is blank headings only; the Research page links the national digital library page for the university. This address goes to http://www.digitallibrary.edu.pk/uniofswat.html. */
export default function Page() {
  return permanentRedirect('http://www.digitallibrary.edu.pk/uniofswat.html')
}
