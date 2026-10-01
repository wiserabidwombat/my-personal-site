import { createFileRoute } from '@tanstack/react-router'
import { Projects } from '../components/Projects'
import { seoMeta, canonicalLink } from '../lib/meta'
import { projectsMeta } from './routeMeta'

export const Route = createFileRoute('/projects/')({
  head: () => ({
    meta: seoMeta(projectsMeta),
    links: [canonicalLink(projectsMeta.path)],
  }),
  component: Projects,
})
