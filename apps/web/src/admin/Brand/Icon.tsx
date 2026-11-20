import Image from 'next/image'
import React from 'react'

import './brand.scss'

/** The small mark at the top of the admin menu (admin.components.graphics.Icon). */
export default function Icon(): React.ReactElement {
  return (
    <Image
      src="/images/crest.png"
      alt="University of Swat"
      width={36}
      height={36}
      className="brand-icon"
    />
  )
}
