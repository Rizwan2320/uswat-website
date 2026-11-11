import { betterAuth } from 'better-auth'
import { passkey } from '@better-auth/passkey'
import { twoFactor } from 'better-auth/plugins'
import pg from 'pg'

export const PORT = Number(process.env.PORT || 3010)
export const ORIGIN = `http://localhost:${PORT}`
export const UV_MODE = process.env.UV_MODE || 'required' // 'required' | 'default'

export const pool = new pg.Pool({
  connectionString: 'postgres://postgres@127.0.0.1:5544/fp0',
  options: '-c search_path=identity', // all identity tables live in their own schema
})

export const authOptions = {
  baseURL: ORIGIN,
  secret: process.env.BETTER_AUTH_SECRET || 'schema-generation-only',
  database: pool,
  emailAndPassword: { enabled: true, minPasswordLength: 15, maxPasswordLength: 128, autoSignIn: true },
  session: { expiresIn: 60 * 60 * 12 },
  advanced: process.env.COOKIE_MODE === 'secure-flag'
    ? { useSecureCookies: true, cookiePrefix: '__Host-portal' } // observed first: library forces a __Secure- prefix in front
    : { useSecureCookies: false, cookiePrefix: '__Host-portal', defaultCookieAttributes: { secure: true, httpOnly: true, sameSite: 'lax', path: '/' } },
  plugins: [
    passkey({
      rpID: 'localhost',
      rpName: 'FP0 spike',
      origin: ORIGIN,
      ...(UV_MODE === 'required' ? { authenticatorSelection: { userVerification: 'required', residentKey: 'preferred' } } : {}),
    }),
    twoFactor({ issuer: 'FP0 spike', totpOptions: { digits: 6, period: 30 }, backupCodeOptions: { amount: 10 } }),
  ],
}
export const auth = betterAuth(authOptions)
