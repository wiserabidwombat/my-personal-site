import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import {
  Database01Icon,
  HourglassIcon,
  Mail01Icon,
  Notification01Icon,
  PencilEdit02Icon,
  Shield01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { compactHero, pageContainer, pageTitle, pageTitleLeading } from '../../lib/styles'
import { PolicySection, policyLink, policyList, policyStrong } from './privacy/PolicySection'

// Bump whenever the policy changes (YYYY-MM-DD).
const EFFECTIVE_DATE = '2026-10-06'

const effectiveDateLabel = new Date(EFFECTIVE_DATE).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

// TODO: The policy as provided doesn't cover these; add them only if they
// apply to Nanny:
// - TestFlight beta feedback and crash reports, which Apple may share with
//   the developer (the Steady policy has a section on this).
// - Whether Nanny's data is included in device backups (e.g. iCloud
//   Backup), and whether anything syncs between devices.
// - The App Store "data collection" summary line.

// Nanny's privacy policy, at the stable URL given to Apple's TestFlight
// review. Not linked from the Projects page or nav yet. The text matches
// the app's policy as written; reword nothing here without changing the
// app's policy too.
export function NannyPrivacy() {
  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      <section className={compactHero}>
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">Nanny</p>
          <h1 className={cn(pageTitle, pageTitleLeading, 'max-w-3xl font-bold text-balance text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]')}>
            Nanny: Screen Time Limits — Privacy Policy
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
          <p>
            Nanny doesn't collect, store or share any personal information. There are no accounts, servers, analytics,
            ads or tracking. Everything Nanny knows stays on the device it's installed on.
          </p>
        </PolicySection>

        <PolicySection icon={HourglassIcon} title="Screen Time data">
          <p>
            Nanny uses Apple's Screen Time APIs (Family Controls, Managed Settings and Device Activity) to apply the time
            limits, breaks and blackout windows a parent sets. When a parent chooses apps, Apple gives Nanny anonymous
            tokens instead of app names, so Nanny can't see which apps were picked or read your child's app history. iOS
            measures usage on the device and tells Nanny only when a limit is reached. That information never leaves the
            device.
          </p>
        </PolicySection>

        <PolicySection icon={Database01Icon} title="What's stored on the device">
          <ul className={policyList}>
            <li>The rules a parent sets (time limits, breaks, daily limits, blackout windows)</li>
            <li>Whether the device is currently locked and until when</li>
            <li>The parent PIN, stored only as a salted hash in the device's Keychain</li>
          </ul>
          <p>Deleting Nanny removes all of it.</p>
        </PolicySection>

        <PolicySection icon={Notification01Icon} title="Notifications">
          <p>
            Nanny shows local notifications (for example, "10 minutes left") generated on the device. Nothing is sent
            through a server.
          </p>
        </PolicySection>

        <PolicySection icon={UserGroupIcon} title="Children">
          <p>
            Nanny is built for parents and guardians to supervise their own children's device use through Apple's Family
            Sharing. It doesn't collect any information from children.
          </p>
        </PolicySection>

        <PolicySection icon={PencilEdit02Icon} title="Changes">
          <p>If this policy changes, the new version will be posted on this page with a new effective date.</p>
        </PolicySection>

        <PolicySection icon={Mail01Icon} title="Contact">
          <p>
            Questions? Reach me through the{' '}
            <Link to="/contact" className={policyLink}>
              contact page
            </Link>{' '}
            on this site.
          </p>
        </PolicySection>
      </article>
    </div>
  )
}
