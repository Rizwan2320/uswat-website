/* Vice Chancellor's message. Text is quoted VERBATIM from https://uswat.edu.pk/vice-chancellors-message-2/
   (first two sentences, crawled 2026-11-06). The mockup's paragraph is not used because it is not the VC's text.
   Name check: the mockup spelled "Husnun Amin"; the supplied photo caption says "Husnul Amin" (name set by the project owner).
   OPEN: the 2026-11-05 crawl and a re-read on 2026-11-08 show that page signed by "Prof. Dr. Muhammad Qasim", so the
   attribution of this text to the person named above must be confirmed before this goes public. */
export const leadership = {
  name: 'Prof. Dr. Husnul Amin',
  role: 'Vice Chancellor, University of Swat',
  quote:
    'It is with immense pride, humility, and a profound sense of responsibility that I assume the office of Vice Chancellor of the University of Swat. I am honored to serve this distinguished institution at a pivotal moment in its journey and look forward to working collectively with our students, faculty, staff, alumni, partners, and stakeholders to shape a future defined by excellence, innovation, and impact.',
  /* Paragraphs shown in the "Read Full Message" dialog. Only the opening paragraph is verified text so far: the full
     message could not be copied verbatim (the fetch tool returns summaries only) and nothing is invented. While
     fullMessageComplete is false the dialog says the complete text is on the university site and links to it.
     TODO(content): paste the complete message (from the page above) here and set fullMessageComplete to true. */
  fullMessage: [
    'It is with immense pride, humility, and a profound sense of responsibility that I assume the office of Vice Chancellor of the University of Swat. I am honored to serve this distinguished institution at a pivotal moment in its journey and look forward to working collectively with our students, faculty, staff, alumni, partners, and stakeholders to shape a future defined by excellence, innovation, and impact.',
  ],
  fullMessageComplete: false,
  readMoreHref: 'https://uswat.edu.pk/vice-chancellors-message-2/',
  source: 'https://uswat.edu.pk/vice-chancellors-message-2/',
  verifiedAt: '2026-11-06',
}
