/* Stand-in portraits for four of the Sample people, so the directory shows how photos will look. They are used only when the
   person is a Sample record AND has no photo in the CMS: a real upload always wins, and a real person never gets one of these.
   The pictures were supplied by the owner on 2026-11-25 as illustrative images (not real staff); confirm the right to use them
   before launch. Delete this file and `public/images/people/` when real photos are uploaded. */
const PORTRAITS: Record<string, string> = {
  'sample-person-01': '/images/people/sample-person-01.webp',
  'sample-person-03': '/images/people/sample-person-03.webp',
  'sample-person-07': '/images/people/sample-person-07.webp',
  'sample-person-08': '/images/people/sample-person-08.webp',
}

export function samplePortraitOf(slug: string, name: string): { src: string; alt: string } | null {
  const src = PORTRAITS[slug]
  return src ? { src, alt: `Illustrative portrait for the Sample profile of ${name}` } : null
}
