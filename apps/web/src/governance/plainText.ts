/**
 * "Plain text only" for the words an editor types into a page's sections (slice 3ad, agent 4's rule
 * 3): no HTML, no Markdown link, no web address. Links belong in fields that go through
 * `isSafeHref`; a link smuggled into a sentence would skip that check and the layout.
 * Pure, so it is unit-tested without Payload.
 */

const HTML_TAG = /<\s*\/?\s*[a-zA-Z!][^>]*>/
const MARKDOWN_LINK = /\[[^\]]*\]\([^)]*\)/
const WEB_ADDRESS = /(?:\b[a-z][a-z0-9+.-]*:\/\/|\bwww\.|\bjavascript:|\bdata:text)/i

export type PlainTextProblem = 'html' | 'markdown-link' | 'web-address'

/** The first thing wrong with a piece of text, or null if it is plain. */
export function plainTextProblem(value: unknown): PlainTextProblem | null {
  if (typeof value !== 'string' || value === '') return null
  if (HTML_TAG.test(value)) return 'html'
  if (MARKDOWN_LINK.test(value)) return 'markdown-link'
  if (WEB_ADDRESS.test(value)) return 'web-address'
  return null
}

export const PLAIN_TEXT_MESSAGE: Record<PlainTextProblem, string> = {
  html: 'Write plain words here. Remove the HTML tags (the < > parts).',
  'markdown-link':
    'Write plain words here. Remove the [text](address) link; this field cannot hold links.',
  'web-address': 'Write plain words here. Remove the web address; this field cannot hold links.',
}
