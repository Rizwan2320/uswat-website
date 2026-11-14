import { T } from '../components/I18n'

import styles from './Organisation.module.css'

/** Shown on records that hold invented data, so nobody reads them as institutional facts. */
export function SamplePill() {
  return (
    <span className={styles.pill}>
      <T k="Sample" />
    </span>
  )
}

export function SampleNote() {
  return (
    <p className={styles.sampleNote} role="note">
      <T k="This page shows sample data for layout testing. It is not information about the university." />
    </p>
  )
}
