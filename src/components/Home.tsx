import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight02Icon,
  GameController01Icon,
  BookOpen01Icon,
  FishingRodIcon,
  Brain01Icon,
} from '@hugeicons/core-free-icons'
// import { Badge } from '../../@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '../../@/components/ui/card'
import { useTheme } from '../hooks/useTheme'
import dallasSkyline from '../assets/dallas-skyline.webp'

// const transmissionLog = [
//   {
//     title: 'Teaching an AI Agent to Respect My Design System',
//     excerpt:
//       'Notes from wiring prompt-driven workflows into a real component library without losing the plot.',
//     tag: '#coding',
//   },
//   {
//     title: 'What Board Games Taught Me About Leading a Team',
//     excerpt:
//       'Turn order, hidden information, and why the best engineering teams play more like co-op games.',
//     tag: '#boardgames',
//   },
//   {
//     title: 'Why I Build People, Not Just Software',
//     excerpt: 'A few thoughts on mentoring, growth, and treating your team like the real architecture.',
//     tag: '#thoughts',
//   },
// ]

const currentStatus = [
  { label: 'Now Playing', value: 'Heroes of Might and Magic: Olden Era', icon: GameController01Icon },
  { label: 'Now Reading', value: 'Do Aliens Speak Physics by Daniel Whiteson and Andy Warner', icon: BookOpen01Icon },
  { label: 'Now Casting', value: 'Too hot for fishing in Texas', icon: FishingRodIcon },
  { label: 'Now Learning', value: 'AI agent workflows', icon: Brain01Icon },
]

const systemMetrics = [
  { label: 'Role', value: 'Lead Dev' },
  { label: 'Focus', value: 'AI Agent Workflows' },
  { label: 'Roots', value: 'UNT 🦅' },
]

const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

function HeroText() {
  return (
    <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 pb-12 sm:pt-28 sm:pb-16">
      <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
        Full-stack engineer &middot; Gamer &middot; Outdoorsman &middot; Dallas, TX
      </p>
      <h1 className="mt-4 text-4xl font-extrabold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-5xl">
        Hi, I'm Aaron Tilley.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-relaxed text-slate-200">
        Full-stack engineer by day, gamer, fly fisherman, and lifelong learner by night. Welcome
        to my digital workspace.
      </p>
      <Link
        to="/about"
        className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-[var(--laser-cyan)] px-6 py-3 text-sm font-semibold text-[var(--laser-cyan)] shadow-glow-cyan transition-colors duration-300 hover:bg-[var(--laser-cyan)] hover:text-[var(--deep-space-black)]"
      >
        Learn More About Me
        <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

export function Home() {
  const { theme } = useTheme()

  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      {/* One continuous night scene -- sky, the skyline anchored at its
          bottom edge, then a neon floor rising out of the water -- rather
          than text, a photo, and a grid as three separate stacked blocks.
          The scene is inherently nocturnal (it's a night skyline), so it
          only renders in dark mode; light mode keeps the plain themed hero
          every other page uses. */}
      {theme === 'dark' ? (
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#05030c] via-[#12081f] to-[#241040] text-center">
          <HeroText />

          {/* The mask fades the image's own top (sky/stars) and bottom
              (water line) edges to transparent, so the flat section
              gradient above shows through the top seam and the floor grid
              below shows through the bottom seam -- no separate solid-color
              blend divs needed. image-rendering keeps the pixel art crisp
              instead of browser-smoothed. On mobile the panorama is cropped
              to a fixed height rather than shrunk to a sliver, anchored left
              so Reunion Tower and the Margaret Hunt Hill Bridge stay in
              frame even though the American Airlines Center end gets
              cropped off; at sm+ the full panorama displays uncropped. */}
          <img
            src={dallasSkyline}
            alt="Pixel-art neon skyline of Dallas, Texas at night, with Reunion Tower, the Margaret Hunt Hill Bridge, and American Airlines Center reflected in the water below"
            className="block h-48 w-full object-cover [object-position:left_bottom] select-none [image-rendering:pixelated] [mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_80%,transparent_100%)] sm:h-auto"
            loading="eager"
            decoding="async"
          />

          {/* The city's own reflection breaks into an actual neon grid,
              pulled up to overlap the image's own faded water line so the
              two connect with no gap or seam, then recedes toward the
              viewer and fades into the page background (see the
              bg-synth-floor mask in index.css). bg-synth-floor's own
              background-color is opaque (it's meant to stand alone on other
              pages) -- forced transparent here so the overlap actually
              reveals the image's reflection underneath instead of painting
              a solid rectangle over it. */}
          <div className="bg-synth-floor animate-synth-grid relative -mt-24 h-36 !bg-transparent sm:-mt-32 sm:h-44" />
        </section>
      ) : (
        <section className="bg-synth-grid animate-synth-grid text-center">
          <HeroText />
        </section>
      )}

      {/* <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className={headingClass}>Transmission Log</h2>
        <p className="mt-2 text-slate-300">Recent signal from the dev log.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {transmissionLog.map((post) => (
            <article
              key={post.title}
              className="rounded-2xl border border-white/10 bg-[var(--deep-space-purple)]/40 p-5 backdrop-blur-md transition-all duration-300 hover:border-[var(--laser-cyan)]/60 hover:shadow-glow-cyan"
            >
              <Badge variant="secondary" className="text-[10px]">
                {post.tag}
              </Badge>
              <h3 className="mt-3 text-lg font-semibold text-slate-100">{post.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section> */}

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className={headingClass}>Current Status</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {currentStatus.map((item) => (
            <Card key={item.label} className="ring-[var(--cyber-purple)]/40 shadow-glow-purple">
              <CardHeader>
                <HugeiconsIcon
                  icon={item.icon}
                  strokeWidth={2}
                  className="size-6 text-[var(--laser-cyan)]"
                  aria-hidden="true"
                />
                <CardTitle className="mt-2 text-xs font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
                  {item.label}
                </CardTitle>
                <CardDescription className="text-slate-200">{item.value}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Not a <footer> -- that element belongs to the single site-wide
          Footer rendered by the root layout, right after this section. This
          is just this page's own themed closing content block. */}
      <div className="border-t border-[var(--cyber-purple)]/30 px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
          {systemMetrics.map((metric, i) => (
            <span key={metric.label} className="flex items-center gap-2">
              {i > 0 && <span className="text-[var(--cyber-purple)]">&bull;</span>}
              <span className="text-[var(--laser-cyan)]">{metric.label}:</span> {metric.value}
            </span>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            to="/stack"
            className="text-xs font-medium tracking-wide text-slate-500 uppercase transition-colors duration-300 hover:text-[var(--laser-cyan)] hover:[text-shadow:var(--glow-cyan)]"
          >
            How this site is built &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
