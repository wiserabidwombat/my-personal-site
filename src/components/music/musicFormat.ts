import type { MusicResponse, TimeRanges } from '../../types/music'

// Version tags that only describe the release, not a different recording:
// remasters (with or without a year), radio/single/album edits and versions,
// and mono/stereo versions. Remix, live, acoustic, and similar credits are
// different recordings and are kept.
const VERSION_TAGS = [
  /^(?:\d{4}\s+)?(?:digital(?:ly)?\s+)?remaster(?:ed)?(?:\s+\d{4})?(?:\s+(?:version|edition))?(?:\s+\d{4})?$/i,
  /^(?:radio|single|album)\s+(?:edit|version)$/i,
  /^radio\s+mix$/i,
  /^(?:mono|stereo)(?:\s+version)?$/i,
]

const isVersionTag = (tag: string) => VERSION_TAGS.some((pattern) => pattern.test(tag.trim()))

// "With Or Without You - Remastered 2007" -> "With Or Without You". Handles
// a trailing " - Tag" or "(Tag)"/"[Tag]", repeatedly, for display only --
// the full name stays in the tooltip.
export function displayTrackName(name: string): string {
  let current = name.trim()
  for (;;) {
    const dash = current.match(/^(.+?)\s+-\s+([^-]+)$/)
    const bracket = current.match(/^(.+?)\s*[([]([^()[\]]+)[)\]]$/)
    const match = [dash, bracket].find((candidate) => candidate && isVersionTag(candidate[2]))
    if (!match) return current
    current = match[1].trim()
  }
}

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
