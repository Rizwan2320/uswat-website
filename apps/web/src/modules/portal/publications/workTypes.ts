/** Free-text and standard type names from other systems, mapped onto our eight work types. */
import type { WorkType } from './types'

/** Unknown text becomes 'other'; the caller decides what a missing type means. */
export function mapWorkType(text: string): WorkType {
  const t = text.toLowerCase()
  if (/conf|proceed|symposium|workshop/.test(t)) return 'conference'
  if (/chapter|incollection|inbook/.test(t)) return 'chapter'
  if (/thes|dissert/.test(t)) return 'thesis'
  if (/patent/.test(t)) return 'patent'
  if (/report/.test(t)) return 'report'
  if (/\bbook\b|monograph|^book$/.test(t)) return 'book'
  if (/article|journal|preprint|review|letter/.test(t)) return 'article'
  return 'other'
}
