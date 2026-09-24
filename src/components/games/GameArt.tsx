import { useState } from 'react'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { DiceIcon } from '@hugeicons/core-free-icons'

type Props = {
  name: string
  src: string | null | undefined
  className?: string
  // Above-the-fold featured art loads eagerly; everything else is lazy.
  eager?: boolean
  // Inner breathing room around the box; small thumbnails turn it off.
  padded?: boolean
}

// Box art in a fixed 4:3 frame. Boxes come in every shape (square, portrait,
// wide), so the cover is contained -- never cropped -- over a blurred,
// darkened, slightly enlarged copy of itself that fills the frame, so every
// card's image area reads as the same size. The backdrop reuses the same URL
// (already cached), so it costs no extra download.
// A missing URL or a failed load both fall back to a styled dice placeholder,
// so a card never shows a broken-image icon or collapses in height.
export function GameArt({ name, src, className, eager = false, padded = true }: Props) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <div
      className={cn(
        'relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[var(--deep-space-purple)] to-[var(--deep-space-black)]',
        className,
      )}
    >
      {showImage ? (
        <>
          <img
            src={src ?? undefined}
            alt=""
            aria-hidden="true"
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 size-full scale-125 object-cover opacity-70 blur-xl brightness-50 saturate-150"
          />
          <img
            src={src ?? undefined}
            alt={`${name} box art`}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailed(true)}
            className={cn('relative size-full object-contain drop-shadow-lg', padded && 'p-2')}
          />
        </>
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-[var(--cyber-purple)]">
          <HugeiconsIcon icon={DiceIcon} strokeWidth={1.5} className="size-10" aria-hidden="true" />
          <span className="sr-only">No box art for {name}</span>
        </div>
      )}
    </div>
  )
}
