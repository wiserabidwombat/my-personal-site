import { createFileRoute } from '@tanstack/react-router'
import { PinballLab } from '../components/projects/PinballLab'
import { seoMeta, canonicalLink } from '../lib/meta'
import { pinballLabMeta } from './routeMeta'

export const Route = createFileRoute('/projects/pinball-lab/')({
  head: () => ({
    meta: seoMeta(pinballLabMeta),
    links: [canonicalLink(pinballLabMeta.path)],
  }),
  component: PinballLab,
})
