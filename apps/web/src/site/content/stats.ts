import type { Stat } from './types'

/* Figures confirmed by the user on 2026-11-07 ("we have the confirmation", for the HoD demo). No document was seen
   by us, so `source` records that. The public site's home page still says "49 programs" and "more than 3000
   students enrolled in 2017" (https://uswat.edu.pk/, crawled 2026-11-06); if the university's own numbers differ,
   change them here only. StatsCard shows a "Sample" note automatically if any entry is set back to `sample: true`. */
const CONFIRMED = { source: 'Confirmed by the project owner, 2026-11-07 (no document seen)', verifiedAt: '2026-11-07' }
export const stats: Stat[] = [
  { id: 'programs', value: 50, suffix: '+', label: 'Academic Programs', icon: 'cap', ...CONFIRMED },
  { id: 'students', value: 10000, suffix: '+', label: 'Students', icon: 'people', ...CONFIRMED },
  { id: 'faculty', value: 700, suffix: '+', label: 'Faculty Members', icon: 'person', ...CONFIRMED },
  { id: 'publications', value: 200, suffix: '+', label: 'Research Publications', icon: 'trophy', ...CONFIRMED },
]
