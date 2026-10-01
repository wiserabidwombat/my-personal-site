import { useEffect, useRef, type KeyboardEvent } from 'react'
import { cn } from 'cn'
import type { Screenshot } from './projects-data'
import { StripScrollButton } from './StripScrollButton'
import { useScrollEdges } from './useScrollEdges'

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

// Slack, in px, for subpixel scroll positions when finding the next snap point.
const SLACK = 2

// Edge fades: a mask on the scroll container (not a colored overlay), so it
// works on every theme. --fade-w is the fade width; each side's --fade-l /
// --fade-r is 0 unless that side has more to scroll to. Snap points sit
// --fade-w in from the edge, so a settled screenshot is never under a fade.
const fadeMask = cn(
  '[--fade-w:32px] md:[--fade-w:48px] [--fade-l:0px] [--fade-r:0px]',
  'data-[fade-start=true]:[--fade-l:var(--fade-w)] data-[fade-end=true]:[--fade-r:var(--fade-w)]',
  '[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-l),#000_calc(100%_-_var(--fade-r)),transparent)]',
)

// A row of phone screenshots, each in a simple rounded frame that matches
// the screen's orientation. Scrolls sideways; edge fades and (on desktop)
// prev/next buttons show which way there's more. Focusable, so Left/Right
// arrow keys step through it. Only the first image loads eagerly.
export function PhoneScreenshots({ screenshots }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const { canScrollBack, canScrollForward } = useScrollEdges(scrollerRef)

  // A button hides once its side can't scroll further; if it had keyboard
  // focus, hand focus back to the strip instead of losing it.
  useEffect(() => {
    const focused = document.activeElement
    const hiddenFocused =
      focused instanceof HTMLButtonElement &&
      ((focused.dataset.scroll === 'back' && !canScrollBack) || (focused.dataset.scroll === 'forward' && !canScrollForward))
    if (hiddenFocused) scrollerRef.current?.focus({ preventScroll: true })
  }, [canScrollBack, canScrollForward])

  // Scrolls to the next or previous screenshot's snap point, so a step is
  // always one whole screenshot, including the wide StandBy one.
  const step = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const padding = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0
    const origin = el.getBoundingClientRect().left - el.scrollLeft
    const targets = [...el.querySelectorAll('li')].map((li) => li.getBoundingClientRect().left - origin - padding)
    const target =
      direction === 1
        ? (targets.find((t) => t > el.scrollLeft + SLACK) ?? el.scrollWidth)
        : (targets.findLast((t) => t < el.scrollLeft - SLACK) ?? 0)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: Math.max(0, target), behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    step(event.key === 'ArrowRight' ? 1 : -1)
  }

  return (
    <div className="relative -mx-6 mt-6 rounded-2xl has-[[data-strip]:focus-visible]:ring-2 has-[[data-strip]:focus-visible]:ring-[var(--laser-cyan)]">
      <div
        ref={scrollerRef}
        data-strip
        data-fade-start={canScrollBack}
        data-fade-end={canScrollForward}
        role="region"
        aria-label="pomodoro-simple screenshots"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={cn(
          'snap-x snap-proximity scroll-px-[var(--fade-w)] overflow-x-auto px-6 pt-2 pb-4 focus:outline-none',
          '[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--laser-cyan)_35%,transparent)_transparent]',
          fadeMask,
        )}
      >
        <ul className="flex items-start gap-5">
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
      </div>

      <StripScrollButton direction="back" enabled={canScrollBack} onClick={() => step(-1)} />
      <StripScrollButton direction="forward" enabled={canScrollForward} onClick={() => step(1)} />
    </div>
  )
}
