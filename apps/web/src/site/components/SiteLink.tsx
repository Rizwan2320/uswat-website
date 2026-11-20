import Link from 'next/link'
import type { ComponentProps } from 'react'

/** A link that stays on this site (Next `Link`, no reload) when `href` is a path, and opens the official site's page as a plain external link otherwise. */
export default function SiteLink({ href, children, ...rest }: Omit<ComponentProps<'a'>, 'href'> & { href: string }) {
  if (href.startsWith('/')) return <Link href={href} {...rest}>{children}</Link>
  return (
    <a href={href} rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  )
}
