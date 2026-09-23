import { createFileRoute, Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { HistoryIcon, Wrench01Icon, GamepadIcon } from '@hugeicons/core-free-icons'
import { JourneyTimeline } from '../components/about/JourneyTimeline'
import { ToolkitGrid } from '../components/about/ToolkitGrid'
import { BeyondTheCode } from '../components/about/BeyondTheCode'
import { bodyText, proseWidth, timelineContentIndent } from '../components/about/typography'
import { buttonVariants } from '@/components/ui/button'
import { seoMeta, canonicalLink } from '../lib/meta'
import { pageContainer, neonOutlineButton, sectionHeading } from '../lib/styles'
import { aboutMeta } from './routeMeta'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: seoMeta(aboutMeta),
    links: [canonicalLink(aboutMeta.path)],
  }),
  component: AboutRouteComponent,
})

const heroRoles = ['SENIOR DEVELOPER', 'FULL-STACK ENGINEER', 'TEAM ENABLER']

// No glow (item 6): heading keeps the neon-pink color but drops the
// text-shadow that every other glowing element on this page also drops.
const headingClass = sectionHeading
// Shared across every section below the hero so the left edge lines up
// (item 9) -- was previously split between max-w-3xl and max-w-4xl.
// Tighter py on mobile: adjacent sections stack both paddings, so py-12
// left ~96px between sections on a small screen.
const sectionClass = cn(pageContainer, 'py-8 sm:py-12')
const proseClass = cn(bodyText, proseWidth)

function AboutRouteComponent() {
  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-10">
          <img
            src="/images/headshot.jpg"
            alt="Aaron Tilley"
            className="size-28 shrink-0 rounded-full border-2 border-[var(--laser-cyan)] object-cover sm:size-32"
          />
          <div className="lg:text-left">
            <div className="flex flex-col items-center gap-1 text-sm font-semibold tracking-[0.15em] text-[var(--laser-cyan)] uppercase sm:flex-row sm:gap-2 sm:tracking-[0.3em] lg:justify-start">
              {heroRoles.map((role, index) => (
                <span key={role} className="flex items-center gap-2 whitespace-nowrap">
                  {index > 0 && (
                    <span className="hidden sm:inline" aria-hidden="true">
                      &middot;
                    </span>
                  )}
                  {role}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
              I build up the people around me.
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              I build full-stack, efficient, and highly maintainable software.
            </p>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <p className={proseClass}>
          I am a Senior Developer specializing in creating robust, scalable applications while fostering
          collaborative, high-performing engineering teams. I believe that great software isn't just about
          clean code—it's about empowering the developers beside you to grow, innovate, and succeed together.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          <HugeiconsIcon icon={HistoryIcon} strokeWidth={2} className="size-6 text-[var(--neon-pink)]" aria-hidden="true" />
          My Journey
        </h2>
        <p className={cn('mt-4', proseClass)}>
          My passion for coding started back in high school, writing simple programs in BASIC.
        </p>
        <div className="mt-8">
          <JourneyTimeline />
        </div>
        {/* Set apart as the section's conclusion: mt-12 clears the timeline's
            own 32px entry gap, the indent lines it up with the entries' text
            column (not the line), and a short pink rule marks the break. */}
        <div className={cn('mt-12', timelineContentIndent)}>
          <div aria-hidden="true" className="mb-5 h-px w-16 bg-linear-to-r from-[var(--neon-pink)] to-transparent" />
          <p className={proseClass}>
            Today, my focus is split between architecting clean full-stack systems and mentoring teams. I am an
            execution-driven learner who is constantly evolving—currently mastering the seamless implementation
            of AI into modern development workflows to accelerate delivery and code quality.
          </p>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          <HugeiconsIcon icon={Wrench01Icon} strokeWidth={2} className="size-6 text-[var(--neon-pink)]" aria-hidden="true" />
          Technical Toolkit
        </h2>
        <ToolkitGrid />
      </section>

      <section className={sectionClass}>
        <h2 className={headingClass}>
          <HugeiconsIcon icon={GamepadIcon} strokeWidth={2} className="size-6 text-[var(--neon-pink)]" aria-hidden="true" />
          Beyond the Code
        </h2>
        <p className={cn('mt-3', proseClass)}>
          When I'm not playing with code or AIs, I like to unplug and stay active. You can usually find me:
        </p>
        <BeyondTheCode />
      </section>

      <section className={cn(sectionClass, 'text-center')}>
        <p className="text-xl font-semibold text-slate-100">Want to work together?</p>
        <div className="mt-5 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/resume" className={buttonVariants({ variant: 'default' })}>
            View my resume
          </Link>
          <Link to="/contact" className={neonOutlineButton}>
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  )
}
