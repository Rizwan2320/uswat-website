import type { OfficeArea, OfficeGroup, OfficeProfile } from '../types'

import { administrationDirectorate } from './administration-directorate'
import { admissions } from './admissions'
import { admissionsHub } from './admissions-hub'
import { affiliatedColleges } from './affiliated-colleges'
import { alumni } from './alumni'
import { calendar } from './calendar'
import { coe } from './coe'
import { convocation } from './convocation'
import { dasr } from './dasr'
import { deanOfficeChemicalSciences } from './dean-office-chemical-sciences'
import { deans } from './deans'
import { developmentalProjects } from './developmental-projects'
import { dit } from './dit'
import { downloads } from './downloads'
import { eOffice } from './e-office'
import { election } from './election'
import { financialAid } from './financial-aid'
import { hunerkada } from './hunerkada'
import { library } from './library'
import { mainCampus } from './main-campus'
import { meritLists } from './merit-lists'
import { office365 } from './office-365'
import { openDay } from './open-day'
import { oric } from './oric'
import { planning } from './planning'
import { pressRelease } from './press-release'
import { proctor } from './proctor'
import { proVc } from './pro-vc'
import { provost } from './provost'
import { qec } from './qec'
import { redCrescent } from './red-crescent'
import { registrar } from './registrar'
import { researchDirectorate } from './research-directorate'
import { researchGroup } from './research-group'
import { sangotaCampus } from './sangota-campus'
import { sports } from './sports'
import { treasurer } from './treasurer'
import { vcOffice } from './vc-office'
import { womenCampus } from './women-campus'
import { works } from './works'
import { ydc } from './ydc'

/* The registry. Order here is the order on the landing pages. Matching is by slug (the route-map slug). */
export const OFFICE_PROFILES: OfficeProfile[] = [
  oric,
  dasr,
  researchDirectorate,
  dit,
  coe,
  works,
  admissions,
  administrationDirectorate,
  planning,
  sports,
  proctor,
  registrar,
  treasurer,
  provost,
  vcOffice,
  proVc,
  financialAid,
  eOffice,
  office365,
  deans,
  deanOfficeChemicalSciences,
  election,
  pressRelease,
  developmentalProjects,
  ydc,
  alumni,
  hunerkada,
]

export const profileForOffice = (slug: string): OfficeProfile | undefined => OFFICE_PROFILES.find((p) => p.slug === slug)
export const officesListedOn = (area: OfficeArea): OfficeProfile[] => OFFICE_PROFILES.filter((p) => p.lists.includes(area))

export const GROUP_ORDER: OfficeGroup[] = ['Directorates', 'Offices and boards', 'Centres and associations']
export function officesByGroup(area: OfficeArea): { group: OfficeGroup; items: OfficeProfile[] }[] {
  const all = officesListedOn(area)
  return GROUP_ORDER.map((group) => ({ group, items: all.filter((p) => p.group === group) })).filter((g) => g.items.length)
}

/* Pages served at their own static address (not under /administration/{slug}), built with the same template. They are not listed on the
   Research or Administration landings (`lists` is empty) and need no CMS record. */
export const PAGE_PROFILES: OfficeProfile[] = [library, qec, calendar, researchGroup,
  mainCampus, womenCampus, sangotaCampus, redCrescent, convocation, openDay, admissionsHub, meritLists, downloads, affiliatedColleges]
export const profileForPage = (slug: string): OfficeProfile | undefined => PAGE_PROFILES.find((p) => p.slug === slug)
