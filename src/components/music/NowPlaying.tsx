import { HeadphonesIcon } from '@hugeicons/core-free-icons'
import type { NowPlaying as NowPlayingData } from '../../types/music'
import { GameSection } from '../games/GameSection'
import { gameCardBaseClass } from '../games/shared'
import { Artwork } from './Artwork'
import { SpotifyLink } from './SpotifyLink'

// Three bars bouncing at staggered delays. Under reduced motion the
// animation is off and the bars hold still at their different heights.
function Equalizer() {
  return (
    <span className="flex h-3.5 items-end gap-0.5" aria-hidden="true">
      <span className="animate-equalizer h-3.5 w-1 rounded-sm bg-[var(--laser-cyan)]" />
      <span className="animate-equalizer h-2 w-1 rounded-sm bg-[var(--laser-cyan)] [animation-delay:-0.3s]" />
      <span className="animate-equalizer h-3 w-1 rounded-sm bg-[var(--laser-cyan)] [animation-delay:-0.6s]" />
    </span>
  )
}

export function NowPlaying({ track }: { track: NowPlayingData }) {
  return (
    <GameSection icon={HeadphonesIcon} title="Now Playing">
      <SpotifyLink
        href={track.spotifyUrl}
        className={`${gameCardBaseClass} mt-6 max-w-md items-center gap-4 p-3 hover:border-[var(--laser-cyan)]/70`}
      >
        {/* The equalizer sits beside the artwork, never on it. */}
        <Artwork url={track.imageUrl} className="w-20 flex-none sm:w-24" />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
            <Equalizer />
            {track.type === 'episode' ? 'Podcast' : 'Playing now'}
          </p>
          <p className="mt-1.5 line-clamp-2 font-semibold text-slate-100" title={track.name}>
            {track.name}
          </p>
          <p className="line-clamp-1 text-sm text-slate-400" title={track.artists}>
            {track.artists}
          </p>
        </div>
      </SpotifyLink>
    </GameSection>
  )
}
