import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, Github01Icon } from '@hugeicons/core-free-icons'
import { compactHero, neonOutlineButton, pageTitle, pageTitleLeading, primaryCyanButton } from '../../lib/styles'
import { ProjectPills } from './ProjectPills'
import { pinballLab } from './projects-data'
import { PINBALL_LAB_TESTFLIGHT_URL } from './pinball-lab-data'

const buttonNote = 'mt-2 max-w-64 text-xs leading-snug text-slate-400'

// Same hero as Steady's (PomodoroHero): back link, title, one-liner, pills,
// then the TestFlight and GitHub buttons. Until there's a public TestFlight
// link, the TestFlight button renders dimmed and inert.
export function PinballLabHero() {
  const { name, summary, links } = pinballLab

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
        <ProjectPills project={pinballLab} className="mt-4 justify-center" />

        <div className="mt-6 mb-8 flex flex-col items-center gap-3 sm:mb-4 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center">
            {PINBALL_LAB_TESTFLIGHT_URL ? (
              <>
                <a href={PINBALL_LAB_TESTFLIGHT_URL} target="_blank" rel="noopener noreferrer" className={primaryCyanButton}>
                  Join the TestFlight beta
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <p className={buttonNote}>You'll need Apple's free TestFlight app; the link walks you through it.</p>
              </>
            ) : (
              <>
                <span aria-disabled="true" className={cn(primaryCyanButton, 'pointer-events-none opacity-50')}>
                  Join the TestFlight beta
                </span>
                <p className={buttonNote}>There's no public TestFlight link yet.</p>
              </>
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
