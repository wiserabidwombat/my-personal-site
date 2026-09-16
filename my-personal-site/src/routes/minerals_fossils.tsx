import { createFileRoute } from '@tanstack/react-router'
import { Fossils } from '../components/Fossils'
import { seoMeta } from '../lib/meta'

export const Route = createFileRoute('/minerals_fossils')({
  head: () => ({
    meta: seoMeta({
      title: 'Minerals & Fossils',
      description: "Browse Aaron's minerals and fossil collection.",
      path: '/minerals_fossils',
    }),
  }),
  component: Fossils,
})
