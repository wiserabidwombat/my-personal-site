import { createFileRoute } from '@tanstack/react-router'
import { Games } from '../components/Games'
import { seoMeta, canonicalLink } from '../lib/meta'
import { gamesMeta } from './routeMeta'

export const Route = createFileRoute('/games')({
  head: () => ({
    meta: seoMeta(gamesMeta),
    links: [canonicalLink(gamesMeta.path)],
  }),
  component: Games,
})
