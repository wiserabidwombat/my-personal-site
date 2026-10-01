import { useState } from 'react'
import { cn } from 'cn'

type Orientation = 'portrait' | 'landscape'

type Props = {
  src?: string
  alt?: string
}

// An image in a post's Markdown body.
//
// Markdown images have no width/height, so before loading they'd collapse to
// their alt text and all sit near the top of the page -- close enough that
// loading="lazy" fetches every one at once. `aspect-ratio: auto 4/3`
// reserves a 4:3 box until the image loads, then switches to its real
// proportions.
//
// Once loaded, the image marks its orientation (data-orientation). A
// portrait image, like a phone screenshot, is capped to about a phone's
// width and centered instead of filling the column, which would make it
// well over 1000px tall; post image groups use the same attribute (see
// BlogPostView). Landscape photos render exactly as before.
export function PostBodyImage({ src, alt }: Props) {
  const [orientation, setOrientation] = useState<Orientation>()

  const measure = (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) {
      setOrientation(img.naturalWidth < img.naturalHeight ? 'portrait' : 'landscape')
    }
  }

  return (
    <img
      // Catches an image that finished loading before hydration, which
      // fires no load event React can see.
      ref={measure}
      src={src}
      alt={alt ?? ''}
      loading="lazy"
      onLoad={(event) => measure(event.currentTarget)}
      data-orientation={orientation}
      className={cn(
        'mt-[16px] w-full rounded-2xl border border-[var(--laser-cyan)]/30 [aspect-ratio:auto_4/3]',
        'data-[orientation=portrait]:mx-auto data-[orientation=portrait]:w-[min(100%,17rem)]',
      )}
    />
  )
}
