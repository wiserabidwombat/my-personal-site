import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '../components/Stack'
import { seoMeta, canonicalLink } from '../lib/meta'
import { stackMeta } from './routeMeta'

export const Route = createFileRoute('/stack')({
  head: () => ({
    meta: seoMeta(stackMeta),
    links: [canonicalLink(stackMeta.path)],
  }),
  component: Stack,
})
