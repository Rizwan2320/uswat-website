import { createAuthClient } from 'better-auth/client'
import { twoFactorClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'
window.authClient = createAuthClient({ basePath: '/portal-api/auth', plugins: [passkeyClient(), twoFactorClient()] })
