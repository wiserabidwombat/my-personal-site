import { createFileRoute } from '@tanstack/react-router'
import { PatientGarden } from '../components/patient-garden/PatientGarden'
import { seoMeta, canonicalLink } from '../lib/meta'
import { gardenMeta } from './routeMeta'

export const Route = createFileRoute('/garden')({
  staticData: { bareLayout: true },
  head: () => ({ meta: [...seoMeta(gardenMeta), { name: 'theme-color', content: '#284c3c' }], links: [canonicalLink(gardenMeta.path), { rel: 'manifest', href: '/garden/manifest.webmanifest' }, { rel: 'apple-touch-icon', href: '/garden/icon-192.png' }] }),
  component: PatientGarden,
})
