import type { ReactNode } from 'react'
import type { MusicTrack } from '../../types/music'
import { Artwork } from './Artwork'
import { SpotifyLink } from './SpotifyLink'

type Props = {
  track: MusicTrack
  // Before the artwork, e.g. a chart position.
  leading?: ReactNode
  // Right-aligned, e.g. "12 min ago".
  trailing?: ReactNode
}

// Compact track row: small artwork, name, and artists, linked to Spotify.
// Long names truncate to one line; the full text is in the tooltip.
export function TrackRow({ track, leading, trailing }: Props) {
  return (
    <SpotifyLink
      href={track.spotifyUrl}
      title={`${track.name} · ${track.artists}`}
      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[var(--deep-space-purple)]/60"
    >
      {leading}
      <Artwork url={track.imageUrl} className="w-10 flex-none sm:w-11" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-100">{track.name}</p>
        <p className="truncate text-xs text-slate-400">{track.artists}</p>
      </div>
      {trailing}
    </SpotifyLink>
  )
}
