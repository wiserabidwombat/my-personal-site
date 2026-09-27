import type { CSSProperties } from 'react'
import { cn } from 'cn'
import { Link } from '@tanstack/react-router'
import { REUNION_BALL, SKYLINE_IMAGE, skylineMobileHeight } from './skylineFraming'

const percent = (value: number, total: number) => `${(value / total) * 100}%`

// The frame is sized exactly like the rendered skyline image: on mobile the
// image's height (width from its aspect ratio, overflowing to the right and
// clipped like the image's own object-cover crop), and from sm up the full
// width. So the ball's position, as percentages of the image, lands on the
// ball at every breakpoint.
const frameVars = {
  '--skyline-ratio': `${SKYLINE_IMAGE.width} / ${SKYLINE_IMAGE.height}`,
  '--ball-x': percent(REUNION_BALL.x, SKYLINE_IMAGE.width),
  '--ball-y': percent(REUNION_BALL.y, SKYLINE_IMAGE.height),
  '--ball-d': percent(REUNION_BALL.diameter, SKYLINE_IMAGE.width),
} as CSSProperties

// Hidden entrance to the Skyline Defense game: a real link over Reunion
// Tower's ball, drawn only as a faint glow (flicker every ~25s, brighter on
// hover/focus -- see reunion-ball-glow in index.css). The link is the size
// of the ball; its ::before extends the tap target to at least 44x44px.
export function ReunionHotspot() {
  return (
    <div
      className={cn(
        skylineMobileHeight,
        'pointer-events-none absolute top-0 left-0 z-20 aspect-(--skyline-ratio) sm:h-auto sm:w-full',
      )}
      style={frameVars}
    >
      <Link
        to="/skyline-defense"
        aria-label="Secret game: Skyline Defense"
        // The game page is noindex; don't invite crawlers to it either.
        rel="nofollow"
        className="reunion-ball-glow pointer-events-auto absolute top-(--ball-y) left-(--ball-x) aspect-square w-(--ball-d) -translate-x-1/2 -translate-y-1/2 rounded-full before:absolute before:top-1/2 before:left-1/2 before:size-[max(44px,100%)] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--laser-cyan)]"
      />
    </div>
  )
}
