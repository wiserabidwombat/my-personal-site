import { cn } from 'cn'
import type { Screenshot } from './projects-data'

type Props = {
  screenshots: readonly Screenshot[]
}

// iPhone screens are 1320x2868. A portrait screen is 11rem wide, so 23.9rem
// tall; a landscape one (StandBy) gets the same 23.9rem height, so it's
// 51.9rem wide. On a phone that's wider than the row, so there it's capped
// to the visible row width (100vw minus the page gutters and its frame),
// which makes it shorter than the portrait ones; it sits centered beside them.
const portraitImage = 'aspect-[1320/2868] w-44'
const landscapeImage = 'aspect-[2868/1320] w-[min(51.9rem,calc(100vw-4.5rem))]'

// Rendered widths for srcset selection: 11rem and 51.9rem at the 16px root
// font, and at the 18px root font from lg up (see index.css).
const portraitSizes = '(min-width: 1024px) 198px, 176px'
const landscapeSizes = '(min-width: 1024px) 935px, (min-width: 903px) 831px, calc(100vw - 72px)'

// A row of phone screenshots, each in a simple rounded frame that matches
// the screen's orientation. Scrolls sideways when the row is wider than the
// page. Only the first image loads eagerly.
export function PhoneScreenshots({ screenshots }: Props) {
  return (
    <ul
      className="-mx-6 mt-6 flex scroll-px-6 snap-x snap-mandatory items-start gap-5 overflow-x-auto px-6 pb-4"
      aria-label="App screenshots"
    >
      {screenshots.map(({ image, caption }, index) => {
        const landscape = image.width > image.height
        return (
          <li key={caption} className={cn('shrink-0 snap-start', landscape && 'self-center')}>
            <figure>
              <div className="rounded-[2.25rem] border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-2">
                <img
                  src={image.src}
                  srcSet={image.srcSet}
                  sizes={landscape ? landscapeSizes : portraitSizes}
                  width={image.width}
                  height={image.height}
                  alt={image.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={cn('rounded-[1.75rem] object-cover', landscape ? landscapeImage : portraitImage)}
                />
              </div>
              <figcaption className="mt-3 text-center text-sm text-slate-400">{caption}</figcaption>
            </figure>
          </li>
        )
      })}
    </ul>
  )
}
