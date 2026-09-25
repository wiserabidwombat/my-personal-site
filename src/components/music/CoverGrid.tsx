import type { IconSvgElement } from '@hugeicons/react'
import type { MusicItem } from '../../types/music'
import { GameSection } from '../games/GameSection'
import { Artwork } from './Artwork'
import { SpotifyLink } from './SpotifyLink'

// Spotify's guidelines cap a content set at 20 items.
const MAX_ITEMS = 20

type Props = {
  icon: IconSvgElement
  title: string
  description?: string
  items: MusicItem[]
}

// Playlists and podcasts: square covers with names, each linking to Spotify.
// Names clamp to two lines, with the full name in the tooltip.
export function CoverGrid({ icon, title, description, items }: Props) {
  return (
    <GameSection icon={icon} title={title} description={description}>
      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5">
        {items.slice(0, MAX_ITEMS).map((item) => (
          <li key={`${item.name}-${item.spotifyUrl}`}>
            <SpotifyLink href={item.spotifyUrl} title={item.name} className="group block rounded-lg">
              <Artwork
                url={item.imageUrl}
                className="transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:group-hover:translate-y-0"
              />
              <p className="mt-2 line-clamp-2 text-sm leading-snug font-medium text-slate-100 group-hover:text-[var(--laser-cyan)]">
                {item.name}
              </p>
            </SpotifyLink>
          </li>
        ))}
      </ul>
    </GameSection>
  )
}
