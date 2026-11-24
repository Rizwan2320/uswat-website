/* Pure helpers for the top-bar department search (no React, no CMS), so they can be unit-tested. */

export type DepartmentOption = { name: string; slug: string; group?: string; /** Where the option leads; a department address when missing. */ href?: string }

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

/** Departments whose name contains every word typed (any order, accents and case ignored). Names that start with the
    text come first, then names with a word starting with it, then the rest; each group stays in the given order.
    An empty query returns everything. */
export function filterDepartments(
  all: DepartmentOption[],
  query: string,
  limit = 50,
): DepartmentOption[] {
  const q = fold(query)
  if (!q) return all.slice(0, limit)
  const words = q.split(' ')
  const ranked: { d: DepartmentOption; rank: number; i: number }[] = []
  all.forEach((d, i) => {
    const name = fold(d.name)
    if (!words.every((w) => name.includes(w))) return
    const rank = name.startsWith(q)
      ? 0
      : name.split(' ').some((n) => n.startsWith(words[0]!))
        ? 1
        : 2
    ranked.push({ d, rank, i })
  })
  return ranked
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .slice(0, limit)
    .map((r) => r.d)
}
