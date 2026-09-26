import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { useTheme } from '../../hooks/useTheme'
import { heroTitle } from '../../lib/resume-data'
import { neonOutlineButton } from '../../lib/styles'
import dallasSkylineDark from '../../assets/dallas-skyline.webp'
import dallasSkylineLight from '../../assets/dallas-skyline-light.webp'

// Shared by both themed <img>s below so they can never drift apart --
// identical height, object-fit/position, rendering, and fade mask. Only
// src and alt differ per theme; see the render below. image-rendering:
// pixelated was tested against the light art specifically (both at 1440px
// and 375px, since the two widths scale the source art differently) and
// made no visible difference -- the source art's own blocky style reads
// the same crisp either way at the sizes this hero displays it, so both
// themes keep it rather than one theme silently diverging from the other.
const skylineImgClass =
  'block h-56 w-full object-cover [object-position:left_bottom] select-none [image-rendering:pixelated] [mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_80%,transparent_100%)] sm:h-auto'

function HeroText() {
  return (
    <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 pb-12 sm:pt-28 sm:pb-16">
      <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
        {heroTitle} &middot; Gamer &middot; Outdoorsman &middot; Dallas, TX
      </p>
      <h1 className="mt-4 text-4xl font-extrabold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-5xl">
        Hi, I'm Aaron Tilley.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-relaxed text-slate-200">
        Full-stack engineer by day, gamer, fly fisherman, and lifelong learner by night. Welcome
        to my digital workspace.
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

      {/* Both themed images are always mounted, shown/hidden purely by the
          theme-dark-only/theme-light-only CSS classes (index.css, keyed off
          the `data-theme` attribute on <html>) rather than a JS ternary
          picking `hidden` from `theme` state -- so scripts/prerender-meta.mjs
          can bake theme-agnostic markup with no light/dark flash on a
          hard/prerendered load (the server has no real `theme` to read; see
          useTheme.ts's SSR guard), while a runtime toggle still swaps
          instantly since it's the same data-theme attribute driving both.
          Both are still eager (never `loading="lazy"`, which on a
          `display:none`/hidden image can silently skip loading it
          altogether, breaking the very toggle this is meant to protect),
          but fetchPriority still tells the browser which one actually
          matters for THIS paint -- it stays keyed off `theme` (a plain
          resource-priority hint, not visible markup, so it doesn't need to
          be CSS-driven): the active image is "high" (it's competing for
          LCP), the inactive one is "low" (it still loads, just deprioritized
          so it stops contending for bandwidth with the active image and the
          rest of the page's critical path). This keeps the no-flash
          guarantee absolute -- both images are always decoded and ready
          before a toggle -- while fixing the actual LCP contention, which
          was the always-mounted approach competing with itself, not the
          mounting strategy itself. Each image's own mask fades its top
          (sky/stars) and bottom (water line) edges to transparent, so the
          section's own gradient shows through the top seam and the floor
          grid below shows through the bottom seam -- no separate
          solid-color blend divs needed. The two images share an identical
          aspect ratio and water-line row (verified against the source
          pixels), so they can share one mask/height/position with no
          per-theme adjustment. On mobile the panorama is cropped to a fixed
          height rather than shrunk to a sliver, anchored left so Reunion
          Tower and the Margaret Hunt Hill Bridge stay in frame even though
          the American Airlines Center end gets cropped off; at sm+ the full
          panorama displays uncropped. */}
      <img
        src={dallasSkylineDark}
        alt="Pixel-art neon skyline of Dallas, Texas at night, with Reunion Tower, the Margaret Hunt Hill Bridge, and American Airlines Center reflected in the water below"
        className={`${skylineImgClass} theme-dark-only`}
        loading="eager"
        decoding="async"
        fetchPriority={theme === 'dark' ? 'high' : 'low'}
      />
      <img
        src={dallasSkylineLight}
        alt="Pixel-art Dallas, Texas skyline at dawn, rendered in a pastel palette, with Reunion Tower, the Margaret Hunt Hill Bridge, and American Airlines Center reflected in the water below"
        className={`${skylineImgClass} theme-light-only`}
        loading="eager"
        decoding="async"
        fetchPriority={theme === 'light' ? 'high' : 'low'}
      />

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
