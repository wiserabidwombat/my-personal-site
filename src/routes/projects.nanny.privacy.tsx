import { createFileRoute } from '@tanstack/react-router'
import { NannyPrivacy } from '../components/projects/NannyPrivacy'
import { seoMeta, canonicalLink } from '../lib/meta'
import { nannyPrivacyMeta } from './routeMeta'

// A stable URL: this is the privacy policy link given to Apple's TestFlight
// review. Not linked from the Projects page or nav yet.
export const Route = createFileRoute('/projects/nanny/privacy')({
  head: () => ({
    meta: seoMeta(nannyPrivacyMeta),
    links: [canonicalLink(nannyPrivacyMeta.path)],
  }),
  component: NannyPrivacy,
})
