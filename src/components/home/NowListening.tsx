import type { RecentTrack } from '../../types/music'
import { displayTrackName } from '../music/musicFormat'
import { SpotifyLogo } from '../music/SpotifyLogo'

// The last track played, as "Track — Artist". Spotify's branding guidelines:
// anything shown from Spotify links back to it and carries the full Spotify
// logo. The track link sits above the card's own stretched link (relative
// z-10), so it opens Spotify while the rest of the card opens the Music page.
export function NowListening({ track }: { track: RecentTrack }) {
  const text = `${displayTrackName(track.name)} — ${track.artists}`
  return (
    <>
      <p className="line-clamp-3 leading-snug" title={`${track.name} — ${track.artists}`}>
        {track.spotifyUrl ? (
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 underline-offset-2 hover:text-[var(--laser-cyan)] hover:underline"
          >
            {text}
            <span className="sr-only"> (listen on Spotify, opens in a new tab)</span>
          </a>
        ) : (
          text
        )}
      </p>
      <div className="mt-3">
        <SpotifyLogo className="h-5" />
      </div>
    </>
  )
}
