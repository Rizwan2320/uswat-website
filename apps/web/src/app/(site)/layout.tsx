import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import '@fontsource-variable/inter'
import '@fontsource-variable/noto-nastaliq-urdu'
import '@fontsource-variable/playfair-display'

import '../../design/tokens.css'
import '../../design/site.css'

import { site } from '@/site/content/site'
import Footer from '@/site/components/Footer'
import Header from '@/site/components/Header'
import { I18nProvider, T } from '@/site/components/I18n'
import TopBar from '@/site/components/TopBar'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: `${site.name}, Khyber Pakhtunkhwa, Pakistan. ${site.tagline}.`,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: site.name,
    description: site.tagline,
    url: '/',
  },
  twitter: { card: 'summary_large_image', title: site.name, description: site.tagline },
  // Prototype: not the official site. TODO(launch): remove this when the real site goes live.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#003B17',
  width: 'device-width',
  initialScale: 1,
}

/* Root layout of the redesigned pages. `data-js` is set before first paint so CSS can tell "JS is running" (used by the
   counters); `suppressHydrationWarning` covers that attribute and the lang/dir the language toggle changes. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','')" }} />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <I18nProvider>
          <a className="skip-link" href="#main">
            <T k="Skip to content" />
          </a>
          <TopBar />
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  )
}
