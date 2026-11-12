import type { ReactNode, SVGProps } from 'react'

/* Inline line icons (24x24, stroke currentColor). Decorative by default (aria-hidden); pass `title` to label one. */
type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { title?: string }

function Svg({ title, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

export const PinIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></Svg>
)
export const SearchIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Svg>
)
export const ChevronDownIcon = (p: IconProps) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
export const ChevronLeftIcon = (p: IconProps) => <Svg {...p}><path d="m15 6-6 6 6 6" /></Svg>
export const ChevronRightIcon = (p: IconProps) => <Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>
export const DoubleChevronLeftIcon = (p: IconProps) => <Svg {...p}><path d="m12 6-6 6 6 6M18 6l-6 6 6 6" /></Svg>
export const DoubleChevronRightIcon = (p: IconProps) => <Svg {...p}><path d="m6 6 6 6-6 6M12 6l6 6-6 6" /></Svg>
export const ArrowRightIcon = (p: IconProps) => <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
export const MoonIcon = (p: IconProps) => <Svg {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" /></Svg>
export const SunIcon = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" /></Svg>
export const MenuIcon = (p: IconProps) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>
export const CloseIcon = (p: IconProps) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>
export const PauseIcon = (p: IconProps) => <Svg {...p}><path d="M9 6v12M15 6v12" /></Svg>
export const PlayIcon = (p: IconProps) => <Svg {...p}><path d="M8 5.5v13l11-6.5-11-6.5Z" /></Svg>
export const CapIcon = (p: IconProps) => (
  <Svg {...p}><path d="m2.5 9.5 9.5-5 9.5 5-9.5 5-9.5-5Z" /><path d="M6.5 12v4.2c0 1.2 2.5 2.8 5.5 2.8s5.5-1.6 5.5-2.8V12" /><path d="M21.5 9.5v6" /></Svg>
)
export const PeopleIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.8 19c.4-3.4 3-5.2 6.2-5.2s5.8 1.8 6.2 5.2" /><circle cx="17" cy="9" r="2.4" /><path d="M17.5 14c2.3.2 3.8 1.6 4.2 4.2" /></Svg>
)
export const PersonIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="8" r="3.6" /><path d="M5 20c.5-4 3.4-6 7-6s6.5 2 7 6" /></Svg>
)
export const TrophyIcon = (p: IconProps) => (
  <Svg {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H4.5c0 3 1.2 4.5 3.7 4.8M16 6h3.5c0 3-1.2 4.5-3.7 4.8" /><path d="M12 13v4M8.5 20h7M10 17h4" /></Svg>
)
export const MegaphoneIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 10v4l11 4V6L4 10Z" /><path d="M8 14.5 9.2 19h2.3l-1-3.5" /><path d="M18.5 9.5a3.5 3.5 0 0 1 0 5" /></Svg>
)
export const GroupIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="8" r="2.8" /><circle cx="5.5" cy="10" r="2.2" /><circle cx="18.5" cy="10" r="2.2" /><path d="M7.5 19c.3-3 2.1-4.6 4.5-4.6s4.2 1.6 4.5 4.6M1.8 18c.2-2.2 1.5-3.4 3.4-3.6M22.2 18c-.2-2.2-1.5-3.4-3.4-3.6" /></Svg>
)
export const BriefcaseIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" /></Svg>
)
export const GavelIcon = (p: IconProps) => (
  <Svg {...p}><path d="m13 5 6 6M10.5 7.5l6 6M6.5 11.5l6 6" /><path d="m4 20 5-5M14 4l-4.5 4.5 6 6L20 10" /></Svg>
)
export const BookIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 6.5C10.4 5.3 8 4.8 4.5 5v12.5c3.5-.2 5.9.3 7.5 1.5 1.6-1.2 4-1.7 7.5-1.5V5c-3.5-.2-5.9.3-7.5 1.5Z" /><path d="M12 6.5V19" /></Svg>
)
export const BadgeIcon = (p: IconProps) => (
  <Svg {...p}><rect x="4" y="3.5" width="16" height="17" rx="2.5" /><circle cx="12" cy="10" r="2.5" /><path d="M7.8 17c.5-2 2-3 4.2-3s3.7 1 4.2 3" /></Svg>
)
export const DocumentIcon = (p: IconProps) => (
  <Svg {...p}><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10.5A.5.5 0 0 1 6.5 20V4a.5.5 0 0 1 .5-.5Z" /><path d="M14 3.5V8h4M9 12h6M9 15.5h6" /></Svg>
)
export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>
)
export const GearIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" /></Svg>
)
export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 4.5h3.5l1.5 4-2 1.3a11 11 0 0 0 5.2 5.2l1.3-2 4 1.5V18a1.5 1.5 0 0 1-1.6 1.5C10.8 19 5 13.2 4.5 6.1A1.5 1.5 0 0 1 5 4.5Z" /></Svg>
)
export const MailIcon = (p: IconProps) => (
  <Svg {...p}><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></Svg>
)

/* Brand marks are filled, not stroked. */
function Mark({ title, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} focusable="false" {...rest}>
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}
export const FacebookIcon = (p: IconProps) => (
  <Mark {...p}><path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" /></Mark>
)
export const YoutubeIcon = (p: IconProps) => (
  <Mark {...p}><path d="M21.6 7.6a2.5 2.5 0 0 0-1.8-1.8C18.2 5.4 12 5.4 12 5.4s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.6C2 9.2 2 12 2 12s0 2.8.4 4.4a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.4.4-4.4s0-2.8-.4-4.4ZM10 15V9l5.2 3L10 15Z" /></Mark>
)
export const LinkedinIcon = (p: IconProps) => (
  <Mark {...p}><path d="M5.2 9.2h3v9.6h-3V9.2ZM6.7 4.4a1.7 1.7 0 1 1 0 3.5 1.7 1.7 0 0 1 0-3.5ZM10.1 9.2H13v1.3c.5-.9 1.6-1.6 3.1-1.6 3 0 3.6 2 3.6 4.5v5.4h-3v-4.8c0-1.2 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5v4.9h-3V9.2Z" /></Mark>
)
export const TiktokIcon = (p: IconProps) => (
  <Mark {...p}><path d="M16.5 3.5c.3 2.2 1.6 3.5 3.8 3.7v3a6.6 6.6 0 0 1-3.7-1.2v5.5a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .8.1v3.1a2.3 2.3 0 1 0 1.5 2.1V3.5h2.9Z" /></Mark>
)

/* Navigation dropdown icons */
export const LaptopIcon = (p: IconProps) => <Svg {...p}><rect x="4" y="5" width="16" height="11" rx="1.6" /><path d="M2 19.5h20" /></Svg>
export const ClipboardCheckIcon = (p: IconProps) => <Svg {...p}><rect x="5" y="4.5" width="14" height="16.5" rx="2" /><path d="M9 4.5V3h6v1.5M9 13.5l2.2 2.2L15.5 11" /></Svg>
export const TrendingIcon = (p: IconProps) => <Svg {...p}><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></Svg>
export const LayersIcon = (p: IconProps) => <Svg {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12.5 9 5 9-5" /><path d="m3 17 9 5 9-5" /></Svg>
export const BuildingIcon = (p: IconProps) => <Svg {...p}><path d="M4 21V8.5L12 3l8 5.5V21" /><path d="M2 21h20M9.5 21v-6h5v6M9 10.5h6" /></Svg>
export const HeartIcon = (p: IconProps) => <Svg {...p}><path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z" /></Svg>
export const FlaskIcon = (p: IconProps) => <Svg {...p}><path d="M9 3h6M10 3v6l-5 9.6A1.6 1.6 0 0 0 6.4 21h11.2a1.6 1.6 0 0 0 1.4-2.4L14 9V3" /><path d="M7.5 15h9" /></Svg>
export const NewspaperIcon = (p: IconProps) => <Svg {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h5" /></Svg>
export const VideoIcon = (p: IconProps) => <Svg {...p}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 11 5-3v8l-5-3" /></Svg>
export const DownloadIcon = (p: IconProps) => <Svg {...p}><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></Svg>
export const WalletIcon = (p: IconProps) => <Svg {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 14.5h2" /></Svg>
export const PaletteIcon = (p: IconProps) => <Svg {...p}><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2H17a4 4 0 0 0 4-4c0-5-4-10-9-10Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></Svg>
