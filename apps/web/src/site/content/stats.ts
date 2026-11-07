import type { Stat } from './types'

/* SAMPLE FIGURES. These are the mockup's numbers and are NOT verified.
   The public site's home page says: established 2010, 22 teaching departments and 49 academic programs,
   "more than 3000 students enrolled in 2017" (https://uswat.edu.pk/ , crawled 2026-11-06), which is older and
   different. StatsCard shows a visible "Sample figures" note while any stat is `sample: true`.
   TODO(content): replace with figures from the Planning/Registrar office, with a source and date. */
export const stats: Stat[] = [
  { id: 'programs', value: 50, suffix: '+', label: 'Academic Programs', icon: 'cap', sample: true },
  { id: 'students', value: 10000, suffix: '+', label: 'Students', icon: 'people', sample: true },
  { id: 'faculty', value: 700, suffix: '+', label: 'Faculty Members', icon: 'person', sample: true },
  { id: 'publications', value: 200, suffix: '+', label: 'Research Publications', icon: 'trophy', sample: true },
]
