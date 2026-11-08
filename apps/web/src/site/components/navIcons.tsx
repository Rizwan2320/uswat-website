import type { ReactElement } from 'react'

import {
  BadgeIcon, BookIcon, BuildingIcon, CalendarIcon, CapIcon, ClipboardCheckIcon, DocumentIcon, DownloadIcon, FlaskIcon,
  GavelIcon, HeartIcon, LaptopIcon, LayersIcon, MegaphoneIcon, NewspaperIcon, PaletteIcon, PeopleIcon, PersonIcon,
  TrendingIcon, TrophyIcon, VideoIcon, WalletIcon,
} from './icons'

/* Icon for a dropdown row, chosen by the `icon` name in content/nav.ts. Unknown names fall back to a plain document. */
const registry: Record<string, () => ReactElement> = {
  badge: () => <BadgeIcon />, book: () => <BookIcon />, building: () => <BuildingIcon />, calendar: () => <CalendarIcon />,
  cap: () => <CapIcon />, clipboard: () => <ClipboardCheckIcon />, document: () => <DocumentIcon />, download: () => <DownloadIcon />,
  flask: () => <FlaskIcon />, gavel: () => <GavelIcon />, heart: () => <HeartIcon />, laptop: () => <LaptopIcon />,
  layers: () => <LayersIcon />, megaphone: () => <MegaphoneIcon />, newspaper: () => <NewspaperIcon />, palette: () => <PaletteIcon />,
  people: () => <PeopleIcon />, person: () => <PersonIcon />, trending: () => <TrendingIcon />, trophy: () => <TrophyIcon />,
  video: () => <VideoIcon />, wallet: () => <WalletIcon />,
}

export function NavIcon({ name }: { name?: string }) {
  return (name && registry[name] ? registry[name] : () => <DocumentIcon />)()
}
