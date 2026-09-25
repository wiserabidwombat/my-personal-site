import { createFileRoute } from '@tanstack/react-router'
import { Music } from '../components/Music'
import { seoMeta, canonicalLink } from '../lib/meta'
import { musicMeta } from './routeMeta'

export const Route = createFileRoute('/music')({
  head: () => ({
    meta: seoMeta(musicMeta),
    links: [canonicalLink(musicMeta.path)],
  }),
  component: Music,
})
