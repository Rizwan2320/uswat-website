import type { ReactNode } from 'react'

import '../../../design/cms.css'

/* Pages, posts and search come from the CMS and use the stock blocks (Tailwind utilities). `.cms` is the
   boundary: its reset and colour mapping apply only inside it (docs/adr/0011). */
export default function CmsLayout({ children }: { children: ReactNode }) {
  return <div className="cms">{children}</div>
}
