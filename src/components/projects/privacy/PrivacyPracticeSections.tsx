import {
  Bug01Icon,
  Cancel01Icon,
  CheckmarkBadge01Icon,
  Delete02Icon,
  FileExportIcon,
  Mail01Icon,
  PencilEdit02Icon,
} from '@hugeicons/core-free-icons'
import { PolicySection, policyLink, policyList, policyStrong } from './PolicySection'

const CONTACT_EMAIL = 'aaronltilley1+pomodoro@gmail.com'

// The privacy policy's second half: what the app doesn't do, exporting,
// crash reports and beta feedback, deleting, changes, the App Store
// summary, and contact. The text is the app's policy as written; don't reword its
// claims here.
export function PrivacyPracticeSections() {
  return (
    <>
      <PolicySection icon={Cancel01Icon} title="What the app doesn't do">
        <ul className={policyList}>
          <li>It makes no network requests of its own. There are no accounts, no sign-in, and no servers.</li>
          <li>
            It contains no analytics, advertising, tracking, or crash-reporting SDKs, and it doesn't share data with
            third parties, because it has none to share.
          </li>
          <li>
            It never accesses your microphone, camera, location, contacts, photos, or health data. (The floating Picture
            in Picture timer on iPad uses an audio session only so that it can keep counting while you use other apps;
            nothing is recorded or played.)
          </li>
        </ul>
      </PolicySection>

      <PolicySection icon={FileExportIcon} title="Exporting your history">
        <p>
          Stats can export your session history as a CSV file. This only happens when you tap Share, and the file goes
          only where you choose to send it.
        </p>
      </PolicySection>

      <PolicySection icon={Bug01Icon} title="Crash reports and beta feedback">
        <p>
          If you've turned on "Share With App Developers" in your device's Analytics settings, Apple may share anonymous
          crash reports and usage data with me, according to Apple's own policies. If you're testing a beta through
          TestFlight, feedback and screenshots you choose to send reach me through Apple. You can turn sharing off at any
          time in Settings.
        </p>
      </PolicySection>

      <PolicySection icon={Delete02Icon} title="Deleting your data">
        <p>
          Deleting the app from your iPhone, iPad, and Apple Watch deletes everything it has stored. Like other app data,
          it's included in your device backups (for example, iCloud Backup), which Apple manages for you.
        </p>
      </PolicySection>

      <PolicySection icon={PencilEdit02Icon} title="Changes">
        <p>If this policy changes, I'll update this page and the date at the top.</p>
      </PolicySection>

      <PolicySection icon={CheckmarkBadge01Icon} title="Data collection summary">
        <p>
          In App Store terms: <strong className={policyStrong}>no data is collected from this app.</strong>
        </p>
      </PolicySection>

      <PolicySection icon={Mail01Icon} title="Contact">
        <p>
          Questions about this policy can be sent to:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className={`${policyLink} [overflow-wrap:anywhere]`}>
            {CONTACT_EMAIL}
          </a>
        </p>
      </PolicySection>
    </>
  )
}
