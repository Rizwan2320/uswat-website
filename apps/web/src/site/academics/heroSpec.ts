import { images } from '../content/images'

import type { Art, DepartmentProfile } from './types'

/* What the one-photograph hero (`HeroBanner`) shows for a department or programme page. DCST sets its own (`heroBanner`: the laptop photograph);
   every other page uses the university's own campus photographs, because the other slide photographs are group portraits. */

export type HeroSpec = { photo: Art; pre?: string; main?: string; accent: string; line: string }

const slide = (name: string): Art => {
  const s = images.heroSlides.find((x) => x.src.includes(name))
  if (!s) throw new Error(`hero photograph missing: ${name}`)
  return { src: s.src, alt: '', width: s.width, height: s.height }
}

/** The main campus at sunset (supplied by the owner, 2026-11-08). */
export const DEFAULT_HERO_PHOTO = slide('hero-6-campus-sunset')
/** The entrance gate, for the end of the statistics strip. Only 450 x 298 px, so it is soft: ask the owner for the original. */
export const DEFAULT_STRIP_PHOTO = slide('hero-7-main-gate')

export function departmentHero(p: DepartmentProfile): HeroSpec {
  if (p.heroBanner) return p.heroBanner
  return {
    photo: DEFAULT_HERO_PHOTO,
    pre: (p.fullName ?? '').startsWith('Faculty of') ? 'Faculty of' : 'Department of',
    accent: p.shortName,
    line: p.tagline,
  }
}

/** A programme page: "Bachelor of Science in" over the name for BS degrees, the name alone for the others (DPT, BBA, B.Ed, BA LL.B). */
export function programmeHero(name: string, tagline: string, department: DepartmentProfile | null): HeroSpec {
  const bs = /^BS\s+/.test(name)
  return {
    photo: department?.heroBanner?.photo ?? DEFAULT_HERO_PHOTO,
    ...(bs ? { pre: 'Bachelor of Science in' } : {}),
    accent: bs ? name.replace(/^BS\s+/, '') : name,
    line: department?.heroBanner?.line ?? tagline,
  }
}
