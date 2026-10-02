import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { compactHero, pageContainer, pageTitle, pageTitleLeading } from '../../lib/styles'
import { policyStrong } from './privacy/PolicySection'
import { PrivacyPracticeSections } from './privacy/PrivacyPracticeSections'
import { PrivacyStorageSections } from './privacy/PrivacyStorageSections'

// Bump whenever the policy changes (YYYY-MM-DD).
const LAST_UPDATED = '2026-10-02'

const lastUpdatedLabel = new Date(LAST_UPDATED).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

// The app's privacy policy, at the stable URL given to Apple. The text
// matches the app's policy as written; reword nothing here without
// changing the app's policy too.
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
          <h1 className={cn(pageTitle, pageTitleLeading, 'max-w-3xl font-bold text-balance text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]')}>
            Privacy Policy for Simple: StandBy Timer
          </h1>
          <p className="text-slate-300">
            <strong className={policyStrong}>Last updated:</strong> <time dateTime={LAST_UPDATED}>{lastUpdatedLabel}</time>
          </p>
        </div>
      </section>

      <article
        className={cn(pageContainer, 'flex flex-col gap-10 py-8 leading-relaxed text-slate-300 sm:py-10 [&>*]:max-w-[70ch]')}
      >
        <p>
          Simple: StandBy Timer does not collect, store, transmit, or share any personal data. Everything the app keeps
          stays on your own devices: your iPhone, your iPad, and your Apple Watch. I never receive any of it.
        </p>
        <PrivacyStorageSections />
        <PrivacyPracticeSections />
      </article>
    </div>
  )
}
