import { Database01Icon, Notification01Icon, SmartWatch01Icon } from '@hugeicons/core-free-icons'
import { PolicySection, policyLink, policyList, policyStrong } from './PolicySection'

// The privacy policy's first half: what the app stores, the Apple Watch
// sync, and notifications, Siri and Focus. The text is the app's policy as
// written; don't reword its claims here.
export function PrivacyStorageSections() {
  return (
    <>
      <PolicySection icon={Database01Icon} title="What the app stores, and where">
        <p>The app keeps the following on your device, and nowhere else:</p>
        <ul className={policyList}>
          <li>The timer's current state (phase, countdown, and where you are in a cycle).</li>
          <li>
            Your session history (when each Focus session ended, how long it was, and which timer profile it used),
            which powers Stats.
          </li>
          <li>
            Your settings: timer profiles (including the names you give them), your accent color, holiday theme, daily
            goal, sounds, and similar preferences.
          </li>
          <li>
            Only finished Focus sessions are recorded; breaks and skipped sessions aren't. If you delete a timer
            profile, its sessions keep the profile's name so Stats can still label them.
          </li>
        </ul>
        <p>
          On iPhone and iPad, this is shared privately between the app and its own widgets and Live Activity through an
          iOS App Group, which only this app can read.
        </p>
      </PolicySection>

      <PolicySection icon={SmartWatch01Icon} title="Apple Watch">
        <p>
          If you use the Apple Watch app, your iPhone and your paired Apple Watch keep each other up to date: the
          timer's state, your active profile, your color, today's progress, and Focus sessions finished on the watch.
          This sync goes directly between your own two devices using Apple's built-in Watch Connectivity service. Apple
          may carry it over Bluetooth, Wi-Fi, or its own network when the devices aren't nearby; either way, it goes only
          between your iPhone and your watch, and I can't see it.
        </p>
        <p>
          Nothing syncs through iCloud. Your iPhone and iPad don't sync with each other; each keeps its own history and
          settings. Only an iPhone and its paired Apple Watch sync.
        </p>
      </PolicySection>

      <PolicySection icon={Notification01Icon} title="Notifications, Siri, and Focus">
        <ul className={policyList}>
          <li>
            <strong className={policyStrong}>Notifications.</strong> The app schedules local notifications ("Focus
            session complete") with Apple's on-device notification system. They're created and delivered entirely on
            your device.
          </li>
          <li>
            <strong className={policyStrong}>Siri and Shortcuts.</strong> So you can say things like "Start Deep Work
            with Simple Timer," your timer profile names are made available to Siri and the Shortcuts app on your
            device. Requests you make to Siri are handled by Apple under{' '}
            <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer" className={policyLink}>
              Apple's Privacy Policy
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </li>
          <li>
            <strong className={policyStrong}>Focus status.</strong> If you turn on "Silence Alerts During Focus," the
            app asks permission to see whether a Focus mode is on. It only learns whether one is on, not which one, and
            that never leaves your device.
          </li>
        </ul>
      </PolicySection>
    </>
  )
}
