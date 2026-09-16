import { createFileRoute } from '@tanstack/react-router'
import { Games } from '../components/Games'
import { seoMeta } from '../lib/meta'

export const Route = createFileRoute('/games')({
  head: () => ({
    meta: seoMeta({
      title: 'Game Inventory',
      description: "Browse Aaron's board game collection.",
      path: '/games',
    }),
  }),
  component: Games,
})
