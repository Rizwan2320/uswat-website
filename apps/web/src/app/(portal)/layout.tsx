import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import '@fontsource-variable/inter'

import '../../design/tokens.css'
import '../../modules/portal/portal.css'

import { COPY } from '@/modules/portal/copy'

export const metadata: Metadata = {
  title: { default: COPY.siteName, template: `%s | ${COPY.siteName}` },
  robots: { index: false, follow: false },
}
export const viewport: Viewport = { themeColor: '#002A10', width: 'device-width', initialScale: 1 }

/* Own root layout: the portal shares no chrome, scripts or styles with the public site or the CMS. */
export default function PortalRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="portal">
        <a className="portal-skip" href="#main">{COPY.skipLink}</a>
        <div className="portal-banner" role="note">{COPY.sampleBanner}</div>
        {children}
      </body>
    </html>
  )
}
