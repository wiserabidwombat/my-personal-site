import type { CSSProperties } from 'react'
import { PixelSprite } from './PixelSprite'
import { batDown, batDownNight, batUp, batUpNight, ghost, jackOLantern, skeleton } from './sprites'

// Loaded only while the Halloween season is active (see Seasonal.tsx), so
// none of this is downloaded the rest of the year. Every sprite is
// aria-hidden and pointer-events-none, placed clear of text and controls,
// and static under prefers-reduced-motion (see halloween.css).

// Each bat drifts across the skyline on the same flight path (halloween.css),
// staggered by `--bat-delay` and nudged up or down by `--bat-offset`. The
// path dips into the bright band near the horizon and the moon, and stays
// below the creature on the skyscraper while crossing its columns.
// `--bat-rest` / `--bat-rest-sm` place each bat when motion is reduced.
// Light mode keeps its original straight, high flight (`--bat-light-top`,
// `--bat-light-rest`): the bats already read against the pale sky there.
type Bat = {
  size: string
  duration: string
  delay: string
  offset: string
  rest: string
  restSm: string
  lightTop: string
  lightRest: string
}
const bats: Bat[] = [
  { size: 'w-8 sm:w-11', duration: '38s', delay: '-4s', offset: '0%', rest: '6vw', restSm: '12vw', lightTop: '6%', lightRest: '14vw' },
  { size: 'w-7 sm:w-9', duration: '52s', delay: '-30s', offset: '3%', rest: '38vw', restSm: '36vw', lightTop: '16%', lightRest: '52vw' },
  { size: 'w-6 sm:w-8', duration: '46s', delay: '-18s', offset: '-2%', rest: '70vw', restSm: '80vw', lightTop: '9%', lightRest: '80vw' },
]

// Over the whole skyline image (the parent wraps it), below the hero text
// and buttons, and above the floor grid that overlaps the image's bottom.
// Light mode keeps the plain bats; dark mode swaps in the rim-lit ones.
export function HeroBats() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      {bats.map((bat) => (
        <div
          key={bat.rest}
          className="halloween-bat absolute left-0"
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
