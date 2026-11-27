/** Small line icons for the home tiles. Decorative: the tile's own words name the destination. */
const PATHS = {
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c0-3.3 3.1-6 7-6s7 2.7 7 6',
  publications: 'M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15ZM5 19.5A1.5 1.5 0 0 0 6.5 21H19M9 7.5h6M9 11h6',
  courses: 'M3 9l9-5 9 5-9 5-9-5Zm4 3.2V16c0 1.4 2.2 3 5 3s5-1.6 5-3v-3.8',
  cv: 'M7 3h7l4 4v14H7V3Zm7 0v4h4M10 12h5M10 16h5',
  delegation: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 8c0-2.8 2.7-5 6-5s6 2.2 6 5M17 11a2.5 2.5 0 1 0 0-5M17.5 14.2c2.2.4 3.5 2 3.5 4.8',
  notifications: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4a2 2 0 0 0 4 0',
  security: 'M12 3l7 3v5.5c0 4.2-2.9 7.6-7 9.5-4.1-1.9-7-5.3-7-9.5V6l7-3Zm-2.5 9 2 2 3.5-4',
  activate: 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9c0-3.3 3.1-6 7-6 1 0 2 .2 2.8.5M15 18l2.2 2.2L21 16',
  review: 'M9 4h6v3H9V4Zm-3 1.5h3M15 5.5h3V21H6V5.5M9.5 14l2 2 3.5-4',
  registrar: 'M12 3l2.4 1.7 2.9-.2 1 2.7 2.4 1.7-.9 2.8.9 2.8-2.4 1.7-1 2.7-2.9-.2L12 21l-2.4-1.7-2.9.2-1-2.7L3.3 15.1 4.2 12.3l-.9-2.8 2.4-1.7 1-2.7 2.9.2L12 3Zm-3 9 2 2 4-4',
  key: 'M14.5 9.5a4 4 0 1 1-1.2-2.8M13 8l8 8M18 16l-2 2M21 13l-2 2',
} as const

export type IconName = keyof typeof PATHS

export default function Icon({ name }: { name: IconName }) {
  return (
    <svg className="portal-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  )
}
