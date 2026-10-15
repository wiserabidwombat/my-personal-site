import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  Cancel01Icon,
  Database01Icon,
  GameController01Icon,
  Mail01Icon,
  PencilEdit02Icon,
  Shield01Icon,
  TestTubeIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { compactHero, pageContainer, pageTitle, pageTitleLeading } from '../../lib/styles'
import { PolicySection, policyLink, policyList, policyStrong } from './privacy/PolicySection'
import { CONTACT_EMAIL } from './privacy/PrivacyPracticeSections'

// Bump whenever the policy changes (YYYY-MM-DD).
const EFFECTIVE_DATE = '2026-10-15'

const effectiveDateLabel = new Date(EFFECTIVE_DATE).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

// Pinball Lab's privacy policy, at the stable URL given to App Store
// Connect. The text matches the app's policy as written; reword nothing
// here without changing the app's policy too.
export function PinballLabPrivacy() {
  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      <section className={compactHero}>
        <div className="relative z-10 flex flex-col items-center">
          <Link
            to="/projects/pinball-lab"
            className="inline-flex items-center gap-1 text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase transition-colors hover:text-[var(--neon-pink)]"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
            Pinball Lab
          </Link>
          <h1 className={cn(pageTitle, pageTitleLeading, 'max-w-3xl font-bold text-balance text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]')}>
            Pinball Lab Privacy Policy
          </h1>
          <p className="text-slate-300">
            <strong className={policyStrong}>Effective date:</strong>{' '}
            <time dateTime={EFFECTIVE_DATE}>{effectiveDateLabel}</time>
          </p>
        </div>
      </section>

      <article
        className={cn(pageContainer, 'flex flex-col gap-10 py-8 leading-relaxed text-slate-300 sm:py-10 [&>*]:max-w-[70ch]')}
      >
        <PolicySection icon={Shield01Icon} title="Summary">
          <p>Pinball Lab does not collect, store or share any personal data.</p>
        </PolicySection>

        <PolicySection icon={Cancel01Icon} title="What the app doesn't do">
          <ul className={policyList}>
            <li>There's no account and no sign-in.</li>
            <li>There's no analytics, advertising or tracking.</li>
            <li>The app makes no network connections.</li>
          </ul>
        </PolicySection>

        <PolicySection icon={Database01Icon} title="What's stored on your device">
          <p>
            High scores and settings (such as volume and camera choice) are saved only on your device. Deleting the app
            deletes them.
          </p>
        </PolicySection>

        <PolicySection icon={GameController01Icon} title="Game controllers">
          <p>Game controllers are read only to play the game. Nothing about them is stored or sent anywhere.</p>
        </PolicySection>

        <PolicySection icon={TestTubeIcon} title="TestFlight">
          <p>
            When you test a beta through TestFlight, Apple may collect crash reports, usage data and any feedback you
            choose to send, and share them with the developer under Apple's TestFlight terms. See{' '}
            <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer" className={policyLink}>
              Apple's Privacy Policy
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </PolicySection>

        <PolicySection icon={UserGroupIcon} title="Children">
          <p>The app collects no data from anyone, including children.</p>
        </PolicySection>

        <PolicySection icon={PencilEdit02Icon} title="Changes">
          <p>If this policy changes, the new version will be posted on this page with a new effective date.</p>
        </PolicySection>

        <PolicySection icon={Mail01Icon} title="Contact">
          <p>
            Questions about this policy can be sent to:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={`${policyLink} [overflow-wrap:anywhere]`}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </PolicySection>
      </article>
    </div>
  )
}
