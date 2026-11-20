/**
 * The caller's network address, and the coarse prefix that is the only part the security log keeps (spec section 7: ipPrefix).
 * Pure: no I/O. A wrong or missing address weakens a counter or leaves a blank in the log, nothing more.
 */
import { isIP } from 'node:net'

/** Client address as Vercel passes it (x-real-ip, else the first x-forwarded-for entry). 'unknown' when neither is present. */
export function clientAddress(headers: Headers | null | undefined): string {
  const real = headers?.get('x-real-ip')
  if (real) return real.trim()
  const fwd = headers?.get('x-forwarded-for')
  return fwd ? (fwd.split(',')[0] ?? '').trim() || 'unknown' : 'unknown'
}

/** Eight 16-bit groups from an IPv6 text address that `isIP` already accepted, or null. */
function hextets(v6: string): number[] | null {
  let a = v6.toLowerCase()
  // A trailing dotted IPv4 (64:ff9b::1.2.3.4, ::ffff:1.2.3.4) becomes two groups.
  const dotted = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(a)
  if (dotted) {
    const [, p, q, r, s] = dotted.map(Number) as [number, number, number, number, number]
    a = a.slice(0, dotted.index) + ((p << 8) | q).toString(16) + ':' + ((r << 8) | s).toString(16)
  }
  const halves = a.split('::')
  if (halves.length > 2) return null
  const parse = (s: string) => (s === '' ? [] : s.split(':').map((g) => parseInt(g, 16)))
  const head = parse(halves[0] ?? '')
  const tail = halves.length === 2 ? parse(halves[1] ?? '') : []
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0
  const all = [...head, ...Array<number>(Math.max(fill, 0)).fill(0), ...tail]
  return all.length === 8 && all.every((n) => Number.isInteger(n) && n >= 0 && n <= 0xffff) ? all : null
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
  const kind = isIP(a)
  if (kind === 0) return null
  if (kind === 4) {
    const [p, q, r] = a.split('.')
    return `${p}.${q}.${r}.0/24`
  }
  const g = hextets(a)
  if (!g) return null
  // ::ffff:a.b.c.d, however it was written: the IPv4 address is in the last two groups.
  if (g.slice(0, 5).every((n) => n === 0) && g[5] === 0xffff) return `${g[6]! >> 8}.${g[6]! & 255}.${g[7]! >> 8}.0/24`
  return `${g[0]!.toString(16)}:${g[1]!.toString(16)}:${g[2]!.toString(16)}::/48`
}
