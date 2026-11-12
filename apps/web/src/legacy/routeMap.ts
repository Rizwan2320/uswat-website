/**
 * Old-address redirects (MIG-02). Pure functions only: no file, network or database access, so the
 * same code runs in the build script, the proxy and the tests.
 *
 * The route map (scripts/import/data/route_map.csv) lists every old public address and where it goes.
 * Three kinds of row exist:
 *   - redirect: the new address differs from the old one, answer 301;
 *   - gone: no new address (a dead link on the old site), answer 410;
 *   - same: the new address equals the old one (66 rows, mostly Pages). Nothing to redirect; the page
 *     is served at the same address once it is imported. Treating these as redirects would loop.
 */

export type RouteMapRow = { oldUrl: string; newUrl: string; action: string }

export type LegacyRules = {
  /** key of the old address -> new address (no trailing slash, except "/") */
  redirects: Record<string, string>
  /** keys that answer 410 */
  gone: string[]
}

/**
 * One key per address, however it was written: percent-escapes decoded (so %F0 and %f0 agree), the
 * host, query and fragment dropped, and the trailing slash removed.
 */
export function legacyKey(addressOrPath: string): string {
  let path = addressOrPath
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) path = new URL(path).pathname
  path = path.split(/[?#]/)[0] || '/'
  try {
    path = decodeURIComponent(path)
  } catch {
    // a malformed escape: keep the text as it came
  }
  if (!path.startsWith('/')) path = `/${path}`
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

/** The new address as the site serves it: no trailing slash, escapes untouched. */
export function canonicalTarget(newUrl: string): string {
  const t = newUrl.trim()
  return t.length > 1 && t.endsWith('/') ? t.slice(0, -1) : t
}

/** A small RFC 4180 reader (quoted fields, doubled quotes, CRLF, leading byte-order mark). */
export function parseCsv(text: string): string[][] {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((f) => f !== '')) rows.push(row)
      row = []
    } else field += c
  }
  row.push(field)
  if (row.some((f) => f !== '')) rows.push(row)
  return rows
}

export function readRows(csv: string): RouteMapRow[] {
  const [header, ...body] = parseCsv(csv)
  const col = (name: string) => {
    const i = header.indexOf(name)
    if (i < 0) throw new Error(`route map: column "${name}" is missing`)
    return i
  }
  const [o, n, a] = [col('old_url'), col('proposed_new_url'), col('action')]
  return body.map((r) => ({ oldUrl: r[o] ?? '', newUrl: r[n] ?? '', action: r[a] ?? '' }))
}

export type Built = { rules: LegacyRules; same: string[]; problems: string[] }

/**
 * Turns rows into rules and reports anything that would break "one hop, 301 or 410": a repeated old
 * address, a row that points at itself through a different spelling, a target that is itself an old
 * address with a different answer (a chain), and a target that is not a path on this site.
 */
export function buildRules(rows: RouteMapRow[]): Built {
  const redirects: Record<string, string> = {}
  const gone: string[] = []
  const same: string[] = []
  const problems: string[] = []
  const seen = new Set<string>()

  for (const [i, row] of rows.entries()) {
    const line = i + 2 // file line number: header is line 1
    const from = legacyKey(row.oldUrl)
    if (seen.has(from)) problems.push(`line ${line}: old address repeated (${from})`)
    seen.add(from)

    if (!row.newUrl) {
      gone.push(from)
      continue
    }
    if (!row.newUrl.startsWith('/') || row.newUrl.startsWith('//')) {
      problems.push(`line ${line}: new address is not a path on this site`)
      continue
    }
    const to = canonicalTarget(row.newUrl)
    if (legacyKey(to) === from) {
      same.push(from)
      continue
    }
    redirects[from] = to
  }

  for (const [from, to] of Object.entries(redirects)) {
    const next = legacyKey(to)
    if (next in redirects) problems.push(`chain: ${from} -> ${to} -> ${redirects[next]}`)
    else if (gone.includes(next)) problems.push(`chain: ${from} -> ${to} which answers 410`)
  }
  return { rules: { redirects, gone: gone.sort() }, same: same.sort(), problems }
}

export type Resolution =
  | { kind: 'redirect'; to: string }
  | { kind: 'gone' }
  | { kind: 'trailing-slash'; to: string }
  | null

/**
 * What to answer for a request path. A mapped address answers 301 or 410 directly, with or without a
 * trailing slash, so there is never a second hop. Any other path ending in a slash gets the framework's
 * usual redirect to the same path without it (that redirect is switched off in next.config so this
 * function is the only place a trailing slash is handled).
 */
export function resolveLegacy(pathname: string, rules: LegacyRules): Resolution {
  const key = legacyKey(pathname)
  if (Object.hasOwn(rules.redirects, key)) return { kind: 'redirect', to: rules.redirects[key] }
  if (rules.gone.includes(key)) return { kind: 'gone' }
  if (pathname.length > 1 && pathname.endsWith('/')) return { kind: 'trailing-slash', to: pathname.replace(/\/+$/, '') || '/' }
  return null
}
