import type { Line } from './digest'
import type { Cadence, DigestKind, NoticeKind } from './kinds'

export type LogEntry = { id: string; class: 'security' | 'digest'; cadence: 'daily' | 'weekly' | null; at: number; lines: { kind: NoticeKind; count: number; firstAt: number; lastAt: number }[] }
export type Waiting = { kind: DigestKind; count: number }[]
export type Overview = { cadence: Cadence; waiting: Waiting; log: LogEntry[] }
export type BuildOutcome = { built: true; lines: Line[] } | { built: false; reason: 'off' | 'not-due' | 'nothing' }

export interface NotificationStore {
  getCadence(userId: string): Promise<Cadence>
  setCadence(userId: string, cadence: Cadence, now: number): Promise<void>
  waiting(userId: string): Promise<Waiting>
  log(userId: string, limit: number): Promise<LogEntry[]>
  /** People with at least one waiting item. */
  withWaiting(limit: number): Promise<string[]>
  /** Builds at most one digest for the person if one is due. Serialised per person. */
  buildDigest(userId: string, now: number): Promise<BuildOutcome>
}
