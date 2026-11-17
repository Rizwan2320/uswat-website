import { createAuthClient } from 'better-auth/client'
import { twoFactorClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'
window.authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: '/portal-api/auth',
  plugins: [passkeyClient(), twoFactorClient()],
})
