import { createFileRoute } from '@tanstack/react-router'
import { Home } from '../components/Home'
import { seoMeta, canonicalLink } from '../lib/meta'
import { homeMeta } from './routeMeta'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: seoMeta(homeMeta),
    links: [canonicalLink(homeMeta.path)],
  }),
  component: Home,
})
