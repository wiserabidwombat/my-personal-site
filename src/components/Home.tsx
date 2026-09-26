import { Link } from '@tanstack/react-router'
import { heroTitle } from '../lib/resume-data'
import { CurrentStatus } from './home/CurrentStatus'
import { ExploreGrid } from './home/ExploreGrid'
import { HeroSkyline } from './home/HeroSkyline'
import { LatestPost } from './home/LatestPost'

// The role comes from the shared resume data so it can't drift from the
// Resume and About pages.
const systemMetrics = [
  { label: 'Role', value: heroTitle },
  { label: 'Focus', value: 'AI Agent Workflows' },
  { label: 'Roots', value: 'UNT' },
]

export function Home() {
  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
      <HeroSkyline />
      <CurrentStatus />
      <LatestPost />
      <ExploreGrid />

      {/* Not a <footer> -- that element belongs to the single site-wide
          Footer rendered by the root layout, right after this section. This
          is just this page's own themed closing content block. */}
      <div className="mt-8 border-t border-[var(--cyber-purple)]/30 px-6 py-6">
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
