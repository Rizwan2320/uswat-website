/* Admissions banner data. `deadlineISO` is the mockup's date (Sept 30, 2026) and is UNVERIFIED: the public Phase-II
   notice (https://uswat.edu.pk/2026/10/undergraduate-admissions-fall-2026-phase-ii/) gives no deadline in text, and the
   home page links a "Final Merit List Fall 2026 (Self Finance)". The date has passed, so the banner shows the closed state.
   TODO(content): set the real deadline for the next intake and this flips back to "Admissions Open" by itself. */
export const admissions = {
  session: 'Fall 2026',
  deadlineISO: '2026-09-30T23:59:59+05:00',
  applyUrl: 'https://cms1.uswat.edu.pk/admission/program/list',
  closedUrl: 'https://uswat.edu.pk/2026/10/undergraduate-admissions-fall-2026-phase-ii/',
  closedDetail: 'Final merit lists are published. The next intake will be announced soon.',
  // Mockup wording; may become "Explore Our Programs".
  servicesHeading: 'Explore Our Services',
  levels: ['Undergraduate', 'Graduate', 'Postgraduate'],
  servicesHref: 'https://uswat.edu.pk/faculty/',
} as const
