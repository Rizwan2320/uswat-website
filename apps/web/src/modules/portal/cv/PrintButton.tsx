'use client'
import { COPY } from '../copy'

export default function PrintButton() {
  return (
    <button type="button" className="portal-btn" onClick={() => window.print()}>{COPY.cv.print}</button>
  )
}
