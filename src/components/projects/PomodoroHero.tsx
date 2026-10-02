import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, Github01Icon } from '@hugeicons/core-free-icons'
import { buttonVariants } from '@/components/ui/button'
import { compactHero, neonOutlineButton, pageTitle, pageTitleLeading } from '../../lib/styles'
import { ProjectPills } from './ProjectPills'
import { pomodoroSimple, TESTFLIGHT_URL } from './projects-data'

// Filled cyan: the page's one primary action. Same color pair as the active
// filter chip (outlinePillActive), which holds its contrast in every theme.
const primaryButton = cn(
  buttonVariants({ size: 'lg' }),
  'border-[var(--laser-cyan)] bg-[var(--laser-cyan)] font-semibold text-[var(--deep-space-black)] hover:bg-[var(--laser-cyan)] hover:shadow-glow-cyan',
)

// An app name in the "Shows up as" line.
const appName = 'font-semibold whitespace-nowrap text-slate-200'

export function PomodoroHero() {
  const { name, displayName, watchDisplayName, summary, links } = pomodoroSimple

  return (
    <section className={compactHero}>
      <div className="relative z-10 flex flex-col items-center">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase transition-colors hover:text-[var(--neon-pink)]"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
          Projects
        </Link>
        <h1 className={cn(pageTitle, pageTitleLeading, 'max-w-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]')}>
          {name}
        </h1>
        <p className="max-w-2xl text-lg leading-snug text-slate-300">{summary}</p>
        <ProjectPills project={pomodoroSimple} className="mt-4 justify-center" />

        <div className="mt-6 mb-8 flex flex-col items-center gap-3 sm:mb-4 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center">
            <a href={TESTFLIGHT_URL} target="_blank" rel="noopener noreferrer" className={primaryButton}>
              Join the beta on TestFlight
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <p className="mt-2 max-w-64 text-xs leading-snug text-slate-400">
              You'll need Apple's free TestFlight app; the link walks you through it.
            </p>
            {displayName && (
              <p className="mt-1 max-w-64 text-xs leading-snug text-slate-400">
                Shows up as <strong className={appName}>{displayName}</strong> on{' '}
                {watchDisplayName && watchDisplayName !== displayName ? (
                  <>
                    iPhone and iPad, and <strong className={appName}>{watchDisplayName}</strong> on Apple Watch
                  </>
                ) : (
                  'iPhone, iPad, and Apple Watch'
                )}
                .
              </p>
            )}
          </div>
          {links.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(neonOutlineButton, 'h-10 gap-2 px-4')}
            >
              <HugeiconsIcon icon={Github01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
              View on GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
