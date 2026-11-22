'use client'
import { COPY } from './copy'
import { authClient, go } from './client'

/** `gold` is the header's call-to-action button, as the public site's "Apply Here" is. */
export default function SignOutButton({ variant }: { variant?: 'gold' }) {
  return (
    <button
      type="button"
      className={variant === 'gold' ? 'phd-signout' : 'portal-btn secondary'}
      onClick={async () => {
        try { await authClient().signOut() } finally { go('/portal/sign-in') }
      }}
    >
      {COPY.signOut}
    </button>
  )
}
