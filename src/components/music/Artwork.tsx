import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { MusicNote01Icon } from '@hugeicons/core-free-icons'

type Props = {
  url: string | null
  // Artist photos are round; album, playlist, and podcast art stays square.
  round?: boolean
  className?: string
}

// Spotify's branding guidelines: artwork stays in its original form -- no
// cropping, overlays, or blur -- with 4px corners on small and medium
// screens and 8px on large ones. object-contain inside a square box never
// crops (Spotify art is square, so it fills the box). Artist photos aren't
// album or podcast artwork, so they can be round like in Spotify's own app.
// Decorative: the name always sits next to it, so the alt text is empty.
export function Artwork({ url, round = false, className }: Props) {
  const shape = round ? 'rounded-full' : 'rounded-[4px] lg:rounded-[8px]'

  if (!url) {
    return (
      <div
        className={cn(
          'flex aspect-square w-full items-center justify-center bg-[var(--deep-space-purple)]',
          shape,
          className,
        )}
      >
        <HugeiconsIcon icon={MusicNote01Icon} strokeWidth={1.5} className="size-1/3 text-slate-500" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn('aspect-square w-full', round ? 'object-cover' : 'object-contain', shape, className)}
    />
  )
}
