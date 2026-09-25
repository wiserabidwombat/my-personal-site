import { useState } from 'react'
import { cn } from 'cn'
import { ChartUpIcon } from '@hugeicons/core-free-icons'
import type { MusicItem, MusicTrack, TimeRanges } from '../../types/music'
import { GameSection } from '../games/GameSection'
import { outlinePill, outlinePillActive } from '../../lib/styles'
import { Artwork } from './Artwork'
import { SpotifyLink } from './SpotifyLink'
import { TrackRow } from './TrackRow'
import { TIME_RANGE_LABELS, type TimeRange } from './musicFormat'

const chipClass = cn(
  outlinePill,
  'cursor-pointer hover:bg-[var(--laser-cyan)]/10 focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-space-black)] focus-visible:outline-none',
)

const subheadingClass = 'text-sm font-semibold tracking-wide text-slate-400 uppercase'

function ArtistGrid({ artists }: { artists: MusicItem[] }) {
  return (
    <ul className="mt-3 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5">
      {artists.map((artist) => (
        <li key={artist.name}>
          <SpotifyLink href={artist.spotifyUrl} title={artist.name} className="group block rounded-lg text-center">
            <Artwork
              url={artist.imageUrl}
              round
              className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
            />
            <p className="mt-2 truncate text-sm font-medium text-slate-100 group-hover:text-[var(--laser-cyan)]">
              {artist.name}
            </p>
          </SpotifyLink>
        </li>
      ))}
    </ul>
  )
}

// Row counts for the two-column track list (the API returns up to 10).
const columnRows = ['', 'md:grid-rows-1', 'md:grid-rows-2', 'md:grid-rows-3', 'md:grid-rows-4', 'md:grid-rows-5']

function TrackList({ tracks }: { tracks: MusicTrack[] }) {
  // Column-first on wider screens: 1-5 down the left, 6-10 down the right.
  const rows = columnRows[Math.ceil(tracks.length / 2)] ?? ''
  return (
    <ol className={cn('mt-2 grid grid-cols-1 gap-x-6', rows && 'md:grid-flow-col', rows)}>
      {tracks.map((track, index) => (
        <li key={`${index}-${track.name}`}>
          <TrackRow
            track={track}
            leading={<span className="w-5 flex-none text-right text-sm font-semibold text-slate-500 tabular-nums">{index + 1}</span>}
          />
        </li>
      ))}
    </ol>
  )
}

type Props = {
  ranges: TimeRange[]
  tracks: TimeRanges<MusicTrack> | undefined
  artists: TimeRanges<MusicItem> | undefined
}

// One toggle drives both lists. Only ranges with data are offered (see
// availableRanges), so a failed range never shows an empty view.
export function TopMusic({ ranges, tracks, artists }: Props) {
  const [selected, setSelected] = useState<TimeRange>(ranges[0])
  const range = ranges.includes(selected) ? selected : ranges[0]
  const rangeArtists = artists?.[range] ?? []
  const rangeTracks = tracks?.[range] ?? []

  return (
    <GameSection icon={ChartUpIcon} title="Top Artists & Tracks">
      {ranges.length > 1 && (
        <div role="group" aria-label="Time range" className="mt-4 flex flex-wrap gap-2">
          {ranges.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={range === option}
              onClick={() => setSelected(option)}
              className={cn(chipClass, range === option && outlinePillActive)}
            >
              {TIME_RANGE_LABELS[option]}
            </button>
          ))}
        </div>
      )}
      {ranges.length === 1 && <p className="mt-2 text-sm text-slate-400">{TIME_RANGE_LABELS[range]}</p>}

      {rangeArtists.length > 0 && (
        <div className="mt-6">
          <h3 className={subheadingClass}>Artists</h3>
          <ArtistGrid artists={rangeArtists} />
        </div>
      )}
      {rangeTracks.length > 0 && (
        <div className="mt-8">
          <h3 className={subheadingClass}>Tracks</h3>
          <TrackList tracks={rangeTracks} />
        </div>
      )}
    </GameSection>
  )
}
