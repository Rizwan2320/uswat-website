/** Test-only RFC 6238 generator (HMAC-SHA1, 6 digits, 30 s). Not used by product code. */
import { createHmac } from 'node:crypto'

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Decode(s: string): Buffer {
  let bits = ''
  for (const ch of s.replace(/=+$/, '').toUpperCase()) bits += B32.indexOf(ch).toString(2).padStart(5, '0')
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2))
  return Buffer.from(bytes)
}

export function totpAt(secretBase32: string, timeMs: number): string {
  const counter = Math.floor(timeMs / 1000 / 30)
  const msg = Buffer.alloc(8)
  msg.writeBigUInt64BE(BigInt(counter))
  const h = createHmac('sha1', base32Decode(secretBase32)).update(msg).digest()
  const o = h[h.length - 1]! & 0xf
  const n = ((h[o]! & 0x7f) << 24) | (h[o + 1]! << 16) | (h[o + 2]! << 8) | h[o + 3]!
  return String(n % 1_000_000).padStart(6, '0')
}
