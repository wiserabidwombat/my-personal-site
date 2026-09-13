import { createFileRoute } from '@tanstack/react-router'
import { Home } from '../components/Home'
import { pageTitle } from '../lib/title'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: pageTitle() }],
  }),
  component: Home,
})
