import Image from 'next/image'
import React from 'react'

import './brand.scss'

/** The login page and nav logo (admin.components.graphics.Logo): crest, name and what this place is. */
export default function Logo(): React.ReactElement {
  return (
    <div
      className="brand-logo"
      role="img"
      aria-label="University of Swat, website content management"
    >
      <Image src="/images/crest.png" alt="" width={72} height={72} className="brand-logo__crest" priority />
      <div className="brand-logo__text">
        <span className="brand-logo__name">University of Swat</span>
        <span className="brand-logo__sub">Website content management</span>
      </div>
    </div>
  )
}
