import { createFileRoute } from '@tanstack/react-router'
import { Home } from '../components/Home'
import { seoMeta } from '../lib/meta'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: seoMeta({
      description: 'Senior Developer specializing in React, .NET, and enterprise CRM systems.',
      path: '/',
    }),
  }),
  component: Home,
})
