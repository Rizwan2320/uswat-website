'use client'
import { COPY } from './copy'
import { authClient, go } from './client'

export default function SignOutButton() {
  return (
    <button
      type="button"
      className="portal-btn secondary"
      style={{ color: 'var(--ivory)', borderColor: 'var(--ivory)' }}
      onClick={async () => {
        try { await authClient().signOut() } finally { go('/portal/sign-in') }
      }}
    >
      {COPY.signOut}
    </button>
  )
}
