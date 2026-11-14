/**
 * Contact details are withheld (brief rule: staff email addresses and phone numbers must not reach
 * public fields without the owner's approval). Values are removed and only counted.
 */

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g
// Pakistani and international numbers: +92 300 1234567, 0092-946-123456, 0946-123456, 0300 1234567.
const PHONE = /(?:\+|00)\d{1,3}[\s-]?\(?\d{2,4}\)?[\s-]?\d{6,8}|\b0\d{2,4}[\s-]?\d{6,8}\b/g

export type Redacted = { text: string; withheld: number }

export function redactContacts(text: string): Redacted {
  let withheld = 0
  const out = text
    .replace(EMAIL, () => (withheld++, ''))
    .replace(PHONE, () => (withheld++, ''))
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
  return { text: out, withheld }
}

/** Attachment links that carry a contact (mailto:, tel:) or are not web addresses are dropped. */
export function attachmentIssue(url: string): 'contact' | 'unsafe' | null {
  const u = url.trim()
  if (/^(mailto|tel):/i.test(u)) return 'contact'
  if (u.startsWith('/') && !u.startsWith('//') && !u.startsWith('/\\')) return null
  try {
    const p = new URL(u).protocol
    return p === 'http:' || p === 'https:' ? null : 'unsafe'
  } catch {
    return 'unsafe'
  }
}
