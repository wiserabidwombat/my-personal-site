import type { CSSProperties } from 'react'
import { PixelSprite } from './PixelSprite'
import { batDown, batUp, ghost, jackOLantern, skeleton } from './sprites'

// Loaded only while the Halloween season is active (see Seasonal.tsx), so
// none of this is downloaded the rest of the year. Every sprite is
// aria-hidden and pointer-events-none, placed clear of text and controls,
// and static under prefers-reduced-motion (see halloween.css).

// Each bat drifts across the full width on its own track: `--bat-delay`
// staggers them, and `--bat-rest` is where it sits when motion is reduced.
const bats: { top: string; size: string; duration: string; delay: string; rest: string }[] = [
  { top: '8%', size: 'w-9 sm:w-11', duration: '38s', delay: '-4s', rest: '14vw' },
  { top: '42%', size: 'w-7 sm:w-9', duration: '52s', delay: '-30s', rest: '52vw' },
  { top: '18%', size: 'w-6 sm:w-8', duration: '46s', delay: '-18s', rest: '80vw' },
]

// Across the sky band above the skyline (the parent positions this layer
// over the image's upper part, below the hero text and buttons).
export function HeroBats() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[4%] h-[28%]">
      {bats.map((bat) => (
        <div
          key={bat.rest}
          className="halloween-bat absolute left-0"
          style={
            {
              top: bat.top,
              '--bat-duration': bat.duration,
              '--bat-delay': bat.delay,
              '--bat-rest': bat.rest,
            } as CSSProperties
          }
        >
          <div className={`halloween-bat-bob relative ${bat.size}`}>
            <PixelSprite art={batUp} className="halloween-flap-a w-full" />
            <PixelSprite art={batDown} className="halloween-flap-b absolute inset-0 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Rises from behind the end of a section heading's line and bobs.
export function PeekingGhost() {
  return (
    <span aria-hidden="true" className="pointer-events-none ml-auto block h-7 w-8 overflow-hidden self-end">
      <PixelSprite art={ghost} className="halloween-ghost w-8" />
    </span>
  )
}

export function HeadingSkeleton() {
  return <PixelSprite art={skeleton} className="halloween-skeleton pointer-events-none h-9 w-auto" />
}

export function FooterPumpkin() {
  return <PixelSprite art={jackOLantern} className="pointer-events-none inline-block h-4 w-auto align-[-3px]" />
}
