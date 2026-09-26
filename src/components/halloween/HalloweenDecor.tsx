import type { CSSProperties } from 'react'
import { PixelSprite } from './PixelSprite'
import { batDown, batDownNight, batUp, batUpNight, ghost, jackOLantern, skeleton } from './sprites'

// Loaded only while the Halloween season is active (see Seasonal.tsx), so
// none of this is downloaded the rest of the year. Every sprite is
// aria-hidden and pointer-events-none, placed clear of text and controls,
// and static under prefers-reduced-motion (see halloween.css).

// Five bats on the same flight path (halloween.css), each with its own
// duration and a height nudge (`--bat-offset`), so crossings overlap instead
// of bunching up. Delays start each bat at an evenly spread point in its own
// cycle (10%, 30%, 50%, 70%, 90%), so they're mid-flight on page load. The
// path dips into the bright band near the horizon and the moon, and stays
// below the creature on the skyscraper while crossing its columns (every
// offset keeps a bat at 42% or lower there).
//
// Phones show three of them (`desktopOnly` hides the rest), and under
// reduced motion the same three rest in place (`rest` / `restSm`, as a
// percent across the skyline). Light mode keeps its straight, high flight
// (`lightTop`, `lightRest`).
type Bat = {
  size: string
  duration: string
  delay: string
  offset: string
  desktopOnly?: boolean
  rest?: string
  restSm?: string
  lightTop: string
  lightRest?: string
}
const bats: Bat[] = [
  { size: 'w-7 sm:w-9', duration: '18s', delay: '-1.8s', offset: '-2%', rest: '6%', restSm: '14%', lightTop: '6%', lightRest: '14%' },
  { size: 'sm:w-11', duration: '21s', delay: '-6.3s', offset: '3%', desktopOnly: true, lightTop: '12%' },
  { size: 'w-8 sm:w-10', duration: '24s', delay: '-12s', offset: '0%', rest: '38%', restSm: '41%', lightTop: '16%', lightRest: '52%' },
  { size: 'sm:w-8', duration: '27s', delay: '-18.9s', offset: '4%', desktopOnly: true, lightTop: '9%' },
  { size: 'w-6 sm:w-9', duration: '30s', delay: '-27s', offset: '1%', rest: '70%', restSm: '91%', lightTop: '20%', lightRest: '80%' },
]

// Over the whole skyline image (the parent wraps it), below the hero text
// and buttons, and above the floor grid that overlaps the image's bottom.
// Light mode keeps the plain bats; dark mode swaps in the rim-lit ones.
export function HeroBats() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      {bats.map((bat) => (
        <div
          key={bat.duration}
          className={`halloween-bat absolute ${bat.desktopOnly ? 'halloween-bat-extra hidden sm:block' : ''}`}
          style={
            {
              '--bat-duration': bat.duration,
              '--bat-delay': bat.delay,
              '--bat-offset': bat.offset,
              '--bat-rest': bat.rest,
              '--bat-rest-sm': bat.restSm,
              '--bat-light-top': bat.lightTop,
              '--bat-light-rest': bat.lightRest,
            } as CSSProperties
          }
        >
          <div className={`halloween-bat-bob relative ${bat.size}`}>
            <PixelSprite art={batUp} className="theme-light-only halloween-flap-a w-full" />
            <PixelSprite art={batDown} className="theme-light-only halloween-flap-b absolute inset-0 w-full" />
            <PixelSprite art={batUpNight} className="theme-dark-only halloween-flap-a w-full" />
            <PixelSprite art={batDownNight} className="theme-dark-only halloween-flap-b absolute inset-0 w-full" />
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
