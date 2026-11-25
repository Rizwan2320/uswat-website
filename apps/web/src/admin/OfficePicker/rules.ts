/**
 * The office picker on the account form (slice 3aq). Pure rules, tested without a browser.
 * An account's offices stay a list of lower-case words matched against a record's owner office
 * (ADR-0010); the picker only stops them being typed by hand and shows what each word matches.
 */

import { normalizeOffice } from '../../governance/roles'

/** The admin's own office, which a new department used to start with. Giving it to a head hands them the admin's pages. */
export const PLACEHOLDER_OFFICE = 'it directorate'

export interface KnownOffice {
  /** The owner-office word, lower case. */
  office: string
  /** What to show: the department's or office's name. */
  name: string
  kind: 'department' | 'office'
  /**
   * Published on the site. A department that is only a draft cannot be opened by its head (a draft belongs
   * to its author until it is sent for review), so the picker says so. Absent when not known.
   */
  live?: boolean
}

/** An office word that cannot yet stand for a department: empty, or the admin's placeholder. */
export const isUnset = (office: string | null | undefined): boolean => {
  const o = normalizeOffice(office ?? '')
  return o === '' || o === PLACEHOLDER_OFFICE
}

export interface Chip {
  office: string
  known: KnownOffice | null
}

/** Each office on the account, with the department or office page it matches (or none). */
export function chips(offices: readonly string[], known: readonly KnownOffice[]): Chip[] {
  return offices.map((office) => ({
    office,
    known: known.find((k) => k.office === normalizeOffice(office)) ?? null,
  }))
}

export interface Option {
  office: string
  name: string
  /** Why it cannot be added yet; absent when it can. */
  disabledReason?: 'unset'
}

/**
 * The departments offered under "Add a department": not already on the account. A head sees only the
 * departments of their own offices (the server holds the same limit); the admin sees all. A department
 * whose office is empty or the admin placeholder is listed but cannot be added.
 */
export function options(
  departments: readonly (KnownOffice | { office: string; name: string; kind?: 'department' })[],
  current: readonly string[],
  who: { role: string; offices: readonly string[] },
): Option[] {
  const have = new Set(current.map(normalizeOffice))
  const mine = new Set(who.offices.map(normalizeOffice))
  const head = who.role !== 'platformAdmin'
  return departments
    .filter((d) => {
      const o = normalizeOffice(d.office)
      if (!isUnset(o) && have.has(o)) return false
      // A head cannot add an office that is not theirs; the unset ones are hidden from them too.
      if (head) return !isUnset(o) && mine.has(o)
      return true
    })
    .map((d) =>
      isUnset(d.office)
        ? { office: '', name: d.name, disabledReason: 'unset' as const }
        : { office: normalizeOffice(d.office), name: d.name },
    )
}

/** Add one office word, lower case, no duplicates, nothing empty. */
export function withOffice(current: readonly string[], add: string): string[] {
  const o = normalizeOffice(add)
  if (o === '' || current.map(normalizeOffice).includes(o)) return [...current]
  return [...current, o]
}

export const withoutOffice = (current: readonly string[], drop: string): string[] =>
  current.filter((o) => normalizeOffice(o) !== normalizeOffice(drop))

export const PICKER_COPY = {
  label: { en: 'Offices', ur: 'دفاتر' },
  intro: {
    en: 'The departments and offices this person works for. A head of department gets their own department here. They can change only pages that belong to these.',
    ur: 'وہ شعبے اور دفاتر جن کے لیے یہ شخص کام کرتا ہے۔ شعبے کے سربراہ کو یہاں اپنا شعبہ ملتا ہے۔ وہ صرف انہی کے صفحات بدل سکتے ہیں۔',
  },
  none: {
    en: 'No office yet. This person cannot change anything until you add one.',
    ur: 'ابھی کوئی دفتر نہیں۔ جب تک آپ ایک نہ دیں، یہ شخص کچھ نہیں بدل سکتا۔',
  },
  addDepartment: { en: 'Add a department', ur: 'شعبہ شامل کریں' },
  choose: { en: 'Choose a department…', ur: 'شعبہ چنیں…' },
  unsetNote: { en: 'its owner office is not set yet', ur: 'اس کا ذمہ دار دفتر ابھی مقرر نہیں' },
  addByName: { en: 'Add another office by name', ur: 'کسی اور دفتر کا نام لکھ کر شامل کریں' },
  add: { en: 'Add', ur: 'شامل کریں' },
  remove: { en: 'Remove', ur: 'ہٹائیں' },
  department: { en: 'Department', ur: 'شعبہ' },
  office: { en: 'Office', ur: 'دفتر' },
  matchesNothing: {
    en: 'matches no department or office page. Check the spelling.',
    ur: 'کسی شعبے یا دفتر کے صفحے سے نہیں ملتا۔ ہجے دیکھیں۔',
  },
  notLive: {
    en: 'not published yet. The head can open it only after you publish it.',
    ur: 'ابھی شائع نہیں ہوا۔ آپ کے شائع کرنے کے بعد ہی سربراہ اسے کھول سکے گا۔',
  },
  loading: { en: 'Loading departments…', ur: 'شعبے لوڈ ہو رہے ہیں…' },
  failed: {
    en: 'The list of departments could not be loaded. You can still add an office by name.',
    ur: 'شعبوں کی فہرست لوڈ نہ ہو سکی۔ آپ پھر بھی دفتر کا نام لکھ سکتے ہیں۔',
  },
} as const
