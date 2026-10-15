import { createFileRoute } from '@tanstack/react-router'
import { PinballLabPrivacy } from '../components/projects/PinballLabPrivacy'
import { seoMeta, canonicalLink } from '../lib/meta'
import { pinballLabPrivacyMeta } from './routeMeta'

// A stable URL: this is the privacy policy link given to App Store Connect.
export const Route = createFileRoute('/projects/pinball-lab/privacy')({
  head: () => ({
    meta: seoMeta(pinballLabPrivacyMeta),
    links: [canonicalLink(pinballLabPrivacyMeta.path)],
  }),
  component: PinballLabPrivacy,
})
