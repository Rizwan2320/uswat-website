import type { Dated } from '../content/types'

/* Fixed locale and zone, so the server and the browser always print the same text (no hydration mismatch). */
const PKT = 'Asia/Karachi'

export function formatDate(iso: string, style: 'long' | 'medium' = 'long'): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: style, timeZone: PKT }).format(new Date(iso))
}

/** "2026-11" -> "Nov 2026". Built from UTC so the zone cannot shift the month. */
export function formatMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y!, (m ?? 1) - 1, 1)),
  )
}

export function isPast(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() < now.getTime()
}

/** Label and machine-readable value for any dated item, or null when it has no date. */
export function itemDate(item: Dated, style: 'long' | 'medium' = 'medium'): { label: string; dateTime: string } | null {
  if (item.dateISO) return { label: formatDate(item.dateISO, style), dateTime: item.dateISO }
  if (item.month) return { label: formatMonth(item.month), dateTime: item.month }
  return null
}

/** Day and month pieces for the event date block. Month-only items show the month over the year. */
export function dateBlock(item: Dated): { top: string; bottom: string; dateTime: string } | null {
  if (item.dateISO) {
    const d = new Date(item.dateISO)
    const parts = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', timeZone: PKT }).formatToParts(d)
    const day = parts.find((p) => p.type === 'day')?.value ?? ''
    const mon = (parts.find((p) => p.type === 'month')?.value ?? '').toUpperCase()
    return { top: day, bottom: mon, dateTime: item.dateISO }
  }
  if (item.month) {
    const [y, m] = item.month.split('-').map(Number)
    const mon = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })
      .format(new Date(Date.UTC(y!, (m ?? 1) - 1, 1)))
      .toUpperCase()
    return { top: mon, bottom: String(y), dateTime: item.month }
  }
  return null
}
