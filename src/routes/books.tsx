import { createFileRoute } from '@tanstack/react-router'
import { Books } from '../components/Books'
import { seoMeta, canonicalLink } from '../lib/meta'
import { booksMeta } from './routeMeta'

export const Route = createFileRoute('/books')({
  head: () => ({
    meta: seoMeta(booksMeta),
    links: [canonicalLink(booksMeta.path)],
  }),
  component: Books,
})
