import { createFileRoute } from '@tanstack/react-router'
import { PomodoroPrivacy } from '../components/projects/PomodoroPrivacy'
import { seoMeta, canonicalLink } from '../lib/meta'
import { pomodoroSimplePrivacyMeta } from './routeMeta'

// A stable URL: this is the privacy policy link given to Apple.
export const Route = createFileRoute('/projects/pomodoro-simple/privacy')({
  head: () => ({
    meta: seoMeta(pomodoroSimplePrivacyMeta),
    links: [canonicalLink(pomodoroSimplePrivacyMeta.path)],
  }),
  component: PomodoroPrivacy,
})
