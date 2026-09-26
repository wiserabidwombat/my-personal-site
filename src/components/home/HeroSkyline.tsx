import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { useTheme } from '../../hooks/useTheme'
import { heroTitle } from '../../lib/resume-data'
import { neonOutlineButton } from '../../lib/styles'
import { SkylineImages } from './SkylineImages'
import { Seasonal } from '../halloween/Seasonal'

const eyebrow = [heroTitle, 'Board Gamer', 'Outdoorsman', 'Dallas, TX']

function HeroText() {
  return (
    <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 pb-12 sm:pt-28 sm:pb-16">
      <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
        {eyebrow.map((item, index) => (
          <span key={item}>
            {/* Each item stays whole (no "Board / Gamer" split on mobile);
                lines only break between items, after a separator. */}
            <span className="whitespace-nowrap">
              {item}
              {index < eyebrow.length - 1 && ' ·'}
            </span>{' '}
          </span>
        ))}
      </p>
      <h1 className="mt-4 text-4xl font-extrabold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-5xl">
        Hi, I'm Aaron Tilley.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-relaxed text-slate-200">
        Full-stack engineer at work, board gamer, fly fisherman, and lifelong learner at not-work. Welcome to my
        site.
      </p>
      {/* Primary button, then the Resume and Blog outline links beside it
          (stacked under it on mobile). */}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/about"
          className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--laser-cyan)] px-6 py-3 text-sm font-semibold text-[var(--laser-cyan)] shadow-glow-cyan transition-colors duration-300 hover:bg-[var(--laser-cyan)] hover:text-[var(--deep-space-black)]"
        >
          Learn More About Me
          <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
        </Link>
        <div className="flex gap-3">
          <Link to="/resume" className={neonOutlineButton}>
            Resume
          </Link>
          <Link to="/blog" className={neonOutlineButton}>
            Blog
          </Link>
        </div>
      </div>
    </div>
  )
}

export function HeroSkyline() {
  const { theme } = useTheme()

  return (
    // One continuous scene per theme -- sky, the skyline anchored at its
    // bottom edge, then a neon floor rising out of the water -- rather than
    // text, a photo, and a grid as three separate stacked blocks. Dark and
    // light both get the full scene (a plain themed hero was tried for
    // light and dropped -- see index.css's bg-synth-grid, still used by
    // every OTHER page's hero); only the sky gradient, the skyline art, and
    // the floor grid's line color are theme-specific. All of it is driven
    // purely by [data-theme='light'] CSS overrides now (index.css), never
    // by a JS ternary reading `theme` and never by Tailwind's
    // prefers-color-scheme-based `dark:` variant (this app's theme is a
    // React Context + data-theme attribute, toggled from the navbar --
    // Tailwind's own dark mode is unused here) -- that's what lets
    // scripts/prerender-meta.mjs bake theme-agnostic HTML with no
    // light/dark flash on a hard/prerendered load, since the server has no
    // real `theme` value to read (see useTheme.ts's SSR guard).
    <section className="hero-sky relative isolate overflow-hidden text-center">
      <HeroText />

      {/* Theme and season variants of the skyline, swapped by CSS so the
          prerendered page paints the right one with no flash -- see
          SkylineImages.tsx. Each image's mask fades its top and bottom edges
          so this section's gradient and the floor grid below show through
          the seams. */}
      <div className="relative">
        <SkylineImages theme={theme} />
        <Seasonal sprite="heroBats" />
      </div>

      {/* The city's own reflection breaks into an actual neon grid, pulled
          up to overlap the image's own faded water line so the two connect
          with no gap or seam, then recedes toward the viewer and fades
          into the page background (see the bg-synth-floor mask in
          index.css). bg-synth-floor's own background-color is opaque (it's
          meant to stand alone on other pages) -- forced transparent here
          so the overlap actually reveals the image's reflection underneath
          instead of painting a solid rectangle over it. The grid LINE
          color is theme-aware (index.css's --synth-floor-line), re-themed
          under [data-theme='light'] to a soft violet pulled from the dawn
          image's own dominant palette instead of reusing --laser-cyan
          as-is, which re-themes to a deep teal that reads off-palette
          against pastel pink/lavender. */}
      <div className="bg-synth-floor animate-synth-grid relative -mt-40 h-44 !bg-transparent sm:-mt-48 sm:h-52" />

      {/* The floor grid's own mask only fades its TOP edge (to blend into
          the skyline's reflection above); its bottom 75% is fully opaque
          grid with a transparent background, so whatever sits behind the
          section shows through the gaps -- which was this section's own
          gradient, ending in a solid color right at the section's bottom
          edge and creating a hard line against the plain section below.
          This overlay fades just that bottom slice out to the page
          background instead, well clear of the top seam/overlap above.
          It resolves to var(--deep-space-black), so it already re-themes
          correctly for both the dark near-black and the light near-white
          background with no per-theme override needed here. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[var(--deep-space-black)] sm:h-20"
      />
    </section>
  )
}
