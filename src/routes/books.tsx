import { createFileRoute } from '@tanstack/react-router'
import { Books } from '../components/Books'
import { seoMeta } from '../lib/meta'

export const Route = createFileRoute('/books')({
  head: () => ({
    meta: seoMeta({
      title: "Books I've Read",
      description: "Browse Aaron's reading library, synced live from Hardcover.",
      path: '/books',
    }),
  }),
  component: Books,
})
