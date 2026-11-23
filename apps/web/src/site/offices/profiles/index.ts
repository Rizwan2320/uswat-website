import type { OfficeArea, OfficeGroup, OfficeProfile } from '../types'

import { alumni } from './alumni'
import { calendar } from './calendar'
import { cmc } from './cmc'
import { coe } from './coe'
import { dasr } from './dasr'
import { defl } from './defl'
import { dit } from './dit'
import { hunerkada } from './hunerkada'
import { library } from './library'
import { oric } from './oric'
import { proctor } from './proctor'
import { qec } from './qec'
import { works } from './works'
import { ydc } from './ydc'

/* The registry. Order here is the order on the landing pages. Matching is by slug (the route-map slug). */
export const OFFICE_PROFILES: OfficeProfile[] = [oric, dasr, dit, coe, works, proctor, ydc, alumni, hunerkada]

export const profileForOffice = (slug: string): OfficeProfile | undefined => OFFICE_PROFILES.find((p) => p.slug === slug)
export const officesListedOn = (area: OfficeArea): OfficeProfile[] => OFFICE_PROFILES.filter((p) => p.lists.includes(area))

export const GROUP_ORDER: OfficeGroup[] = ['Directorates', 'Offices and boards', 'Centres and associations']
export function officesByGroup(area: OfficeArea): { group: OfficeGroup; items: OfficeProfile[] }[] {
  const all = officesListedOn(area)
  return GROUP_ORDER.map((group) => ({ group, items: all.filter((p) => p.group === group) })).filter((g) => g.items.length)
}

/* Pages served at their own static address (not under /administration/{slug}), built with the same template. They are not listed on the
   Research or Administration landings (`lists` is empty) and need no CMS record. */
export const PAGE_PROFILES: OfficeProfile[] = [cmc, defl, library, qec, calendar]
export const profileForPage = (slug: string): OfficeProfile | undefined => PAGE_PROFILES.find((p) => p.slug === slug)
