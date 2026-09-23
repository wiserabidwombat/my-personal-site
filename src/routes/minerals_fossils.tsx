import { createFileRoute } from '@tanstack/react-router'
import { Fossils } from '../components/Fossils'
import { seoMeta, canonicalLink } from '../lib/meta'
import { mineralsFossilsMeta } from './routeMeta'

export const Route = createFileRoute('/minerals_fossils')({
  head: () => ({
    meta: seoMeta(mineralsFossilsMeta),
    links: [canonicalLink(mineralsFossilsMeta.path)],
  }),
  component: Fossils,
})
