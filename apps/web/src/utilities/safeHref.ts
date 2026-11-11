/**
 * Addresses typed into the CMS (link fields, attachment links) reach `href` attributes. Only these are
 * allowed: http(s), mailto, tel, a site-relative path (`/...`, not `//host`), or an in-page anchor (`#...`).
 * Anything else (`javascript:`, `data:`, `vbscript:`, protocol-relative, malformed) is refused.
 * The CMS validates on save; this is the second guard where the site renders the value.
 */
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

export function isSafeHref(value: string | null | undefined): boolean {
  if (typeof value !== 'string') return false
  const v = value.trim()
  if (!v) return false
  if (/[\u0000-\u001f\u007f]/.test(v)) return false // browsers drop tabs and newlines inside a scheme: refuse them outright
  if (v.startsWith('#')) return true
  if (v.startsWith('/')) return !v.startsWith('//') && !v.startsWith('/\\')
  try {
    return ALLOWED_PROTOCOLS.has(new URL(v).protocol)
  } catch {
    return false
  }
}

/** The trimmed address if it is safe to render, otherwise null. */
export function safeHref(value: string | null | undefined): string | null {
  return isSafeHref(value) ? (value as string).trim() : null
}
