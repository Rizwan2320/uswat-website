/** Dates are shown in Pakistan time, in English, on the server only, so a late-evening date does not slip a day. */
const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Karachi' })
const fmtTime = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Karachi',
})

export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : fmt.format(d)
}

export function formatDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : fmtTime.format(d)
}

/** True when the record has an end date at or before `now`, or has been archived. */
export function isClosed(gov: { status?: string | null; expireAt?: string | null } | null | undefined, now: Date): boolean {
  if (!gov) return false
  if (gov.status === 'archived') return true
  if (!gov.expireAt) return false
  const end = new Date(gov.expireAt)
  return !Number.isNaN(end.getTime()) && end.getTime() <= now.getTime()
}
