import { createFileRoute } from '@tanstack/react-router'
import { Games } from '../components/Games'
import { pageTitle } from '../lib/title'

export const Route = createFileRoute('/games')({
  head: () => ({
    meta: [{ title: pageTitle('Game Inventory') }],
  }),
  component: Games,
})
