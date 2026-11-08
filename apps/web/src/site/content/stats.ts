import type { Stat } from './types'

/* Figures given by the project owner on 2026-11-08 as the university's real numbers (they replaced the mockup's
   50+/10,000+/700+/200+ confirmed a day earlier). No document was seen by us, so `source` records that. The public
   home page (https://uswat.edu.pk/, crawled 2026-11-06) still says "49 programs" and "more than 3000 students enrolled
   in 2017"; change a number here only. StatsCard shows a "Sample" note automatically if an entry is set back to
   `sample: true`. */
const CONFIRMED = { source: 'Given by the project owner, 2026-11-08 (no document seen)', verifiedAt: '2026-11-08' }
export const stats: Stat[] = [
  { id: 'programs', value: 80, suffix: '+', label: 'Academic Programs', icon: 'cap', ...CONFIRMED },
  { id: 'students', value: 9000, suffix: '+', label: 'Students', icon: 'people', ...CONFIRMED },
  { id: 'faculty', value: 150, suffix: '+', label: 'Faculty Members', icon: 'person', ...CONFIRMED },
  { id: 'publications', value: 70, suffix: '+', label: 'Research Publications', icon: 'trophy', ...CONFIRMED },
]
