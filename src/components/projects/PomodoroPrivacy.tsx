import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { compactHero, headingText, pageContainer, pageTitle, pageTitleLeading } from '../../lib/styles'
import { TodoNote } from './TodoNote'

// TODO: set to the date you confirm the final policy (YYYY-MM-DD), and bump
// it whenever the policy changes.
const LAST_UPDATED = '2026-10-01'

// TODO: your contact email for privacy questions.
const CONTACT_EMAIL = '[contact email]'

const lastUpdatedLabel = new Date(LAST_UPDATED).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

// The questions the final policy has to answer.
const openQuestions = [
  'What data does the app store (settings, session history, anything else)?',
  'Does any of it ever leave the device (iCloud sync, a server, widgets sharing data)?',
  'Does the app use analytics or crash reporting, beyond what TestFlight and Apple provide?',
  'What contact email should people use for privacy questions?',
]

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={cn(headingText, 'font-bold text-slate-50')}>{title}</h2>
      {children}
    </section>
  )
}

export function PomodoroPrivacy() {
  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      <section className={compactHero}>
        <div className="relative z-10 flex flex-col items-center">
          <Link
            to="/projects/pomodoro-simple"
            className="inline-flex items-center gap-1 text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase transition-colors hover:text-[var(--neon-pink)]"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
            pomodoro-simple
          </Link>
          <h1 className={cn(pageTitle, pageTitleLeading, 'max-w-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]')}>
            pomodoro-simple Privacy Policy
          </h1>
          <p className="text-slate-300">
            Last updated <time dateTime={LAST_UPDATED}>{lastUpdatedLabel}</time>
          </p>
        </div>
      </section>

      <article className={cn(pageContainer, 'flex flex-col gap-8 py-8 sm:py-10')}>
        <div className="max-w-[70ch]">
          <TodoNote>
            <p className="inline">Answer these before the policy goes to Apple:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {openQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          </TodoNote>
        </div>

        <div className="flex max-w-[70ch] flex-col gap-8 leading-relaxed text-slate-300">
          <TodoNote>
            Draft for the simplest case: everything stays on the device and nothing is collected. Confirm or edit
            every section below, then remove these notes.
          </TodoNote>

          <PolicySection title="Summary">
            <p>
              pomodoro-simple doesn't collect any personal data. It has no accounts, no analytics, and no ads, and
              nothing you do in the app is sent to me or anyone else.
            </p>
          </PolicySection>

          <PolicySection title="Data stored on your device">
            <p>
              The app saves [your timer settings] on your device so they're there the next time you open it. That
              data never leaves your device, and deleting the app deletes it.
            </p>
          </PolicySection>

          <PolicySection title="TestFlight betas">
            <p>
              If you install a beta through TestFlight, Apple may share crash reports and any feedback you choose to
              send with me, as described in Apple's TestFlight terms. I use these only to fix bugs.
            </p>
          </PolicySection>

          <PolicySection title="Changes to this policy">
            <p>If this policy changes, I'll update it here and change the date at the top of this page.</p>
          </PolicySection>

          <PolicySection title="Contact">
            <p>Questions about this policy? Email me at {CONTACT_EMAIL}.</p>
          </PolicySection>
        </div>
      </article>
    </div>
  )
}
