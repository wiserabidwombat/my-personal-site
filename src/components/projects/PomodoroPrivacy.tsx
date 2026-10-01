import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { compactHero, headingText, pageContainer, pageTitle, pageTitleLeading } from '../../lib/styles'

// Bump whenever the policy changes (YYYY-MM-DD).
const LAST_UPDATED = '2026-10-01'

const lastUpdatedLabel = new Date(LAST_UPDATED).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

const storedData = [
  {
    label: 'Session history',
    text: "one record for each completed Focus session, with when it ended, how long it ran, and which timer profile it used (including the profile's name, so your stats stay labeled if you delete a profile). Breaks and skipped sessions aren't recorded.",
  },
  {
    label: 'Settings',
    text: 'your timer profiles, the active profile, accent color, sound and chime choices, Keep Screen Awake, and your daily goal.',
  },
  {
    label: 'Timer state',
    text: 'the current phase and time remaining, so the timer, widgets and Lock Screen stay in sync. This is shared only between the app and its own widgets on your phone.',
  },
  { label: 'A few small flags', text: "like whether you've seen the Help screen." },
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

      <article
        className={cn(pageContainer, 'flex flex-col gap-8 py-8 leading-relaxed text-slate-300 sm:py-10 [&>*]:max-w-[70ch]')}
      >
        <PolicySection title="Short version">
          <p>
            pomodoro-simple doesn't collect any data. Everything the app saves stays on your iPhone. There's no account,
            no server, no analytics, and nothing syncs through iCloud.
          </p>
        </PolicySection>

        <PolicySection title="What the app stores on your phone">
          <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-[var(--laser-cyan)]">
            {storedData.map(({ label, text }) => (
              <li key={label}>
                <strong className="font-semibold text-slate-50">{label}:</strong> {text}
              </li>
            ))}
          </ul>
        </PolicySection>

        <PolicySection title="Where your data goes">
          <p>
            Nowhere. None of it is sent to me or anyone else. If you use Export to CSV, the file goes only where you
            choose to send it.
          </p>
        </PolicySection>

        <PolicySection title="Backups and deleting">
          <p>
            Your data is included in your iPhone's normal iCloud or computer backup, so it comes back if you restore your
            phone. It doesn't sync between devices. Deleting the app erases everything it stored.
          </p>
        </PolicySection>

        <PolicySection title="TestFlight betas">
          <p>
            If you're testing a beta through TestFlight, Apple may share crash reports and any feedback or screenshots
            you choose to send with me. That's handled by Apple under Apple's privacy policy, not by the app itself.
          </p>
        </PolicySection>

        <PolicySection title="Changes">
          <p>If the app ever starts handling data differently, I'll update this page and the date above.</p>
        </PolicySection>

        <p>
          Questions? Reach me through my{' '}
          <Link
            to="/contact"
            className="font-medium text-[var(--laser-cyan)] underline underline-offset-4 transition-colors hover:text-[var(--neon-pink)]"
          >
            Contact page
          </Link>
          .
        </p>
      </article>
    </div>
  )
}
