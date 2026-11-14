/**
 * "Shared computer" sign-in option (Addendum C SES-04). The page sets a short-lived cookie before signing in; whatever
 * makes the session records it. A browser can only ask for the stricter limit: the flag can shorten the idle time,
 * never lengthen it.
 */
export const SHARED_COOKIE = '__Host-portal.shared'
export const SHARED_COOKIE_VALUE = '1'
/** Long enough for password then code; the session itself carries the flag after that. */
export const SHARED_COOKIE_MAX_AGE_S = 600

/** True when the request's Cookie header carries the shared-computer choice. */
export function sharedRequested(cookieHeader: string | null | undefined): boolean {
  if (!cookieHeader) return false
  return cookieHeader.split(';').some((part) => {
    const i = part.indexOf('=')
    return i > 0 && part.slice(0, i).trim() === SHARED_COOKIE && part.slice(i + 1).trim() === SHARED_COOKIE_VALUE
  })
}
