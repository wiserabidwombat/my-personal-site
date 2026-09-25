import { Clock01Icon } from '@hugeicons/core-free-icons'
import type { RecentTrack } from '../../types/music'
import { GameSection } from '../games/GameSection'
import { formatRelativeTime } from './musicFormat'
import { TrackRow } from './TrackRow'

export function RecentlyPlayed({ tracks }: { tracks: RecentTrack[] }) {
  const now = new Date()

  return (
    <GameSection icon={Clock01Icon} title="Recently Played">
      <ol className="mt-4 grid grid-cols-1 gap-x-6 md:grid-cols-2">
        {tracks.map((track) => (
          <li key={`${track.playedAt}-${track.name}`}>
            <TrackRow
              track={track}
              trailing={
                <time dateTime={track.playedAt} className="flex-none text-xs text-slate-500">
                  {formatRelativeTime(track.playedAt, now)}
                </time>
              }
            />
          </li>
        ))}
      </ol>
    </GameSection>
  )
}
