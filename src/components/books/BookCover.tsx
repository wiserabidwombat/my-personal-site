import { useState } from 'react'
import { cn } from 'cn'
import { getResizedImageUrl } from '../../lib/image'

// Shown when a book has no cover URL at all, or its cover URL 404s/fails to
// load (Hardcover's data isn't guaranteed to have a working image for every
// book) -- a T-Rex with famously short arms failing to pick a book up off
// the ground reads better than a plain broken-image icon.
const NO_COVER_IMAGE = '/books/trex-no-cover.jpg'

type Props = {
  url: string | null
  title: string
  className?: string
}

// A 2:3 portrait cover, cropped to fill. 'large' returns the cover URL
// unresized/uncropped: the wsrv proxy's 'thumbnail'/'medium' sizes
// hard-crop to a square, which double-crops badly in a 2:3 box.
export function BookCover({ url, title, className }: Props) {
  const [failed, setFailed] = useState(false)
  const showCover = !failed && Boolean(url)

  return (
    <img
      src={showCover && url ? getResizedImageUrl(url, 'large') : NO_COVER_IMAGE}
      alt={showCover ? `Cover of ${title}` : `No cover available for ${title}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('aspect-[2/3] w-full object-cover', className)}
    />
  )
}
