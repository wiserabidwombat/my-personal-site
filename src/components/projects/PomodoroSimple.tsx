import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { CheckmarkCircle02Icon, Image01Icon, TestTubeIcon, Wrench01Icon } from '@hugeicons/core-free-icons'
import { SectionHeading } from '../SectionHeading'
import { pageContainer } from '../../lib/styles'
import { PhoneScreenshots } from './PhoneScreenshots'
import { PomodoroHero } from './PomodoroHero'
import { pomodoroBuildStory, pomodoroFeatures, pomodoroScreenshots } from './projects-data'

// Prose width cap (~70 characters), shared by the page's text blocks.
const prose = 'max-w-[70ch] leading-relaxed text-slate-300'

function Section({ icon, title, children }: { icon: IconSvgElement; title: string; children: ReactNode }) {
  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <SectionHeading icon={icon}>{title}</SectionHeading>
      {children}
    </section>
  )
}

export function PomodoroSimple() {
  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      <PomodoroHero />

      <Section icon={Image01Icon} title="Screenshots">
        <PhoneScreenshots screenshots={pomodoroScreenshots} />
      </Section>

      <Section icon={CheckmarkCircle02Icon} title="Features">
        <ul className={cn(prose, 'mt-4 flex flex-col gap-3')}>
          {pomodoroFeatures.map((feature) => (
            <li key={feature.title} className="flex items-start gap-3">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={2}
                className="mt-1 size-4 shrink-0 text-[var(--laser-cyan)]"
                aria-hidden="true"
              />
              <span>
                <strong className="font-semibold text-slate-50">{feature.title}:</strong> {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={Wrench01Icon} title="How I Built It">
        <div className={cn(prose, 'mt-4 flex flex-col gap-4')}>
          {pomodoroBuildStory.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section icon={TestTubeIcon} title="Beta Builds">
        <p className={cn(prose, 'mt-2')}>
          Beta builds on TestFlight are refreshed periodically. Read the{' '}
          <Link
            to="/projects/pomodoro-simple/privacy"
            className="font-medium text-[var(--laser-cyan)] underline underline-offset-4 transition-colors hover:text-[var(--neon-pink)]"
          >
            privacy policy
          </Link>
          .
        </p>
      </Section>
    </div>
  )
}
