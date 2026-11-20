/**
 * The caller's network address, and the coarse prefix that is the only part the security log keeps (spec section 7: ipPrefix).
 * Pure: no I/O and no Node imports, so the browser can use it to label the sessions list. A wrong or missing
 * address weakens a counter or leaves a blank in the log, nothing more.
 */
/** Client address as Vercel passes it (x-real-ip, else the first x-forwarded-for entry). 'unknown' when neither is present. */
export function clientAddress(headers: Headers | null | undefined): string {
  const real = headers?.get('x-real-ip')
  if (real) return real.trim()
  const fwd = headers?.get('x-forwarded-for')
  return fwd ? (fwd.split(',')[0] ?? '').trim() || 'unknown' : 'unknown'
}

const OCTET = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)'
const V4 = new RegExp(`^${OCTET}(\\.${OCTET}){3}$`)
const GROUP = /^[0-9a-f]{1,4}$/i

/** Eight 16-bit groups from an IPv6 text address, or null if it is not a well-formed one. */
function hextets(v6: string): number[] | null {
  let a = v6.toLowerCase()
  // A trailing dotted IPv4 (64:ff9b::1.2.3.4, ::ffff:1.2.3.4) becomes two groups.
  const dotted = /(\d+\.\d+\.\d+\.\d+)$/.exec(a)
  if (dotted) {
    if (!V4.test(dotted[1]!)) return null
    const [p, q, r, s] = dotted[1]!.split('.').map(Number) as [number, number, number, number]
    a = a.slice(0, dotted.index) + ((p << 8) | q).toString(16) + ':' + ((r << 8) | s).toString(16)
  }
  const halves = a.split('::')
  if (halves.length > 2) return null
  const parse = (part: string): string[] | null => {
    if (part === '') return []
    const groups = part.split(':')
    return groups.every((g) => GROUP.test(g)) ? groups : null
  }
  const head = parse(halves[0] ?? '')
  const tail = halves.length === 2 ? parse(halves[1] ?? '') : []
  if (!head || !tail) return null
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0
  if (fill < 0 || (halves.length === 2 && fill < 1)) return null
  const all = [...head, ...Array<string>(fill).fill('0'), ...tail].map((g) => parseInt(g, 16))
  return all.length === 8 ? all : null
}

/**
 * IPv4: the first three bytes, "203.0.113.0/24". IPv6: the first three groups, "2001:db8:abcd::/48".
 * An IPv4 address carried inside IPv6 is treated as IPv4. Anything else, including 'unknown', gives null.
 */
export function ipPrefix(address: string | null | undefined): string | null {
  if (!address) return null
  let a = address.trim()
  if (a.startsWith('[') && a.endsWith(']')) a = a.slice(1, -1)
  const zone = a.indexOf('%')
  if (zone >= 0) a = a.slice(0, zone)
  if (V4.test(a)) {
    const [p, q, r] = a.split('.')
    return `${p}.${q}.${r}.0/24`
  }
  if (!a.includes(':')) return null
  const g = hextets(a)
  if (!g) return null
  // ::ffff:a.b.c.d, however it was written: the IPv4 address is in the last two groups.
  if (g.slice(0, 5).every((n) => n === 0) && g[5] === 0xffff) return `${g[6]! >> 8}.${g[6]! & 255}.${g[7]! >> 8}.0/24`
  return `${g[0]!.toString(16)}:${g[1]!.toString(16)}:${g[2]!.toString(16)}::/48`
}
