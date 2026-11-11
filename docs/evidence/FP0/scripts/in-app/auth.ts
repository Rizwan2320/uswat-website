import { betterAuth } from 'better-auth'
import { passkey } from '@better-auth/passkey'
import { twoFactor } from 'better-auth/plugins'
import pg from 'pg'

const ORIGIN = process.env.PORTAL_ORIGIN ?? 'http://localhost:3020'

// Spike only: one pool, search_path pinned to the identity schema.
const pool = new pg.Pool({
  connectionString: process.env.IDENTITY_DATABASE_URL,
  options: '-c search_path=identity',
})

export const auth = betterAuth({
  baseURL: ORIGIN,
  basePath: '/portal-api/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  database: pool,
  emailAndPassword: { enabled: true, minPasswordLength: 15, maxPasswordLength: 128, autoSignIn: true },
  session: { expiresIn: 60 * 60 * 12 },
  // Spike only: the library's rate limiter is on by default in production; this switch lets the test suite run a burst of sign-ins.
  ...(process.env.RATE_LIMIT === 'off' ? { rateLimit: { enabled: false } } : {}),
  advanced: { useSecureCookies: false, cookiePrefix: '__Host-portal', defaultCookieAttributes: { secure: true, httpOnly: true, sameSite: 'lax', path: '/' } },
  plugins: [
    passkey({ rpID: 'localhost', rpName: 'FP0 in-app spike', origin: ORIGIN, authenticatorSelection: { userVerification: 'required', residentKey: 'preferred' } }),
    twoFactor({ issuer: 'FP0 in-app spike', totpOptions: { digits: 6, period: 30 }, backupCodeOptions: { amount: 10 } }),
  ],
})
