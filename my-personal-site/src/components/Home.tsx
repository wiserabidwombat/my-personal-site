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
  { label: 'Now Reading', value: 'Star Trek Lower Decks', icon: BookOpen01Icon },
  { label: 'Now Casting', value: 'Too hot to handle in Texas', icon: FishingRodIcon },
  { label: 'Now Learning', value: 'AI agent workflows', icon: Brain01Icon },
]

const systemMetrics = [
  { label: 'Role', value: 'Lead Dev' },
  { label: 'Focus', value: 'React / Node' },
  { label: 'Roots', value: 'UNT 🦅' },
]

const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

export function Home() {
  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      <section className="bg-synth-grid animate-synth-grid px-6 py-28 text-center">
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
            Full-stack engineer &middot; gamer &middot; outdoorsman
          </p>
          <h1 className="mt-4 text-4xl font-extrabold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-5xl">
            Hi, I'm Aaron Tilley.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-relaxed text-slate-200">
            Full-stack engineer by day, gamer, fly fisherman, and lifelong learner by night.
            Welcome to my digital workspace.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-[var(--laser-cyan)] px-6 py-3 text-sm font-semibold text-[var(--laser-cyan)] shadow-glow-cyan transition-colors duration-300 hover:bg-[var(--laser-cyan)] hover:text-[var(--deep-space-black)]"
          >
            Learn More About Me
            <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

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

      <footer className="border-t border-[var(--cyber-purple)]/30 px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
          {systemMetrics.map((metric, i) => (
            <span key={metric.label} className="flex items-center gap-2">
              {i > 0 && <span className="text-[var(--cyber-purple)]">&bull;</span>}
              <span className="text-[var(--laser-cyan)]">{metric.label}:</span> {metric.value}
            </span>
          ))}
        </div>
      </footer>
    </div>
  )
}
