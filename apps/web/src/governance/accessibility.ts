/**
 * Accessibility guard rules for rich text (CMS-08, plan v2 section 3 feature 16).
 *
 * Pure functions over Lexical JSON. They check what an editor writes in rich text; they cannot
 * see headings inside coded blocks, so they are a safety net, not a full audit (axe in CI is).
 */

/** Link texts that say nothing out of context (WCAG 2.4.4). Lower case; one place to adjust. */
export const BARE_LINK_TEXTS = ['click here', 'here', 'click', 'this link', 'link'] as const

export interface LexicalFindings {
  /** Heading levels (1 to 6) in document order. */
  headings: number[]
  /** The visible text of every link. */
  links: string[]
  /** Images placed in the text (`upload` nodes). */
  uploads: { relationTo: string; value: unknown }[]
}

type Node = {
  type?: string
  tag?: string
  text?: string
  children?: Node[]
  relationTo?: string
  value?: unknown
}

const textOf = (n: Node): string =>
  (n.text ?? '') + (n.children ?? []).map((c) => textOf(c)).join('')

/** Collect headings, links and images from a Lexical editor state (or any node of one). */
export function lexicalFindings(root: unknown): LexicalFindings {
  const out: LexicalFindings = { headings: [], links: [], uploads: [] }
  const walk = (n: Node | undefined): void => {
    if (!n || typeof n !== 'object') return
    if (n.type === 'heading' && typeof n.tag === 'string') {
      const level = Number(/^h([1-6])$/.exec(n.tag)?.[1])
      if (level) out.headings.push(level)
    }
    if (n.type === 'link' || n.type === 'autolink') out.links.push(textOf(n).trim())
    if (n.type === 'upload' && n.relationTo) {
      out.uploads.push({ relationTo: n.relationTo, value: n.value })
    }
    for (const c of n.children ?? []) walk(c)
  }
  const r = root as { root?: Node } | undefined
  walk(r?.root ?? (root as Node))
  return out
}

/**
 * The page title is the H1, so the first heading may be at most H2 and each next heading may go
 * at most one level deeper than the one before it. Going back up any number of levels is fine.
 * Returns the position (1-based) and levels of the first skip, or null.
 */
export function firstHeadingSkip(
  levels: number[],
): { at: number; from: number; to: number } | null {
  let prev = 1
  for (let i = 0; i < levels.length; i++) {
    const to = levels[i]
    if (to > prev + 1) return { at: i + 1, from: prev, to }
    prev = to
  }
  return null
}

export const isBareLinkText = (text: string): boolean =>
  (BARE_LINK_TEXTS as readonly string[]).includes(
    text
      .trim()
      .toLowerCase()
      .replace(/[.!:]+$/, ''),
  )
