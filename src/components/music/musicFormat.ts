import type { MusicResponse, TimeRanges } from '../../types/music'

// "just now", "12 min ago", "3 hr ago", "2 days ago"; older plays show the
// date ("Sep 12").
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso)
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60_000)
  if (Number.isNaN(minutes)) return ''
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return days === 1 ? '1 day ago' : `${days} days ago`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export type TimeRange = 'shortTerm' | 'mediumTerm'

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  shortTerm: 'Last 4 weeks',
  mediumTerm: 'Last 6 months',
}

// Ranges with any data in either top list, in display order. A range whose
// Spotify calls both failed (or came back empty) isn't offered.
export function availableRanges(
  tracks: TimeRanges<unknown> | undefined,
  artists: TimeRanges<unknown> | undefined,
): TimeRange[] {
  return (['shortTerm', 'mediumTerm'] as const).filter(
    (range) => (tracks?.[range]?.length ?? 0) > 0 || (artists?.[range]?.length ?? 0) > 0,
  )
}

// True when the API answered but has nothing at all to show.
export function isEmptyMusic(music: MusicResponse): boolean {
  return (
    !music.nowPlaying &&
    !music.recentlyPlayed?.length &&
    availableRanges(music.topTracks, music.topArtists).length === 0 &&
    !music.playlists?.length &&
    !music.podcasts?.length
  )
}
