import { createRootRoute, HeadContent } from '@tanstack/react-router'
import { Navbar } from '../components/navbar'
import { PageTransition } from '../components/PageTransition'
import { seoMeta } from '../lib/meta'

export const Route = createRootRoute({
  head: () => ({
    // Site-wide fallback: any route that doesn't set its own seoMeta() still
    // gets a complete, correct set of tags (TanStack Router lets a child
    // route's meta override the root's by matching `name`/`property`).
    meta: seoMeta({
      description:
        "Aaron Tilley's portfolio -- Senior Developer specializing in React, .NET, and enterprise CRM systems.",
      path: '/',
    }),
    links: [
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: "Aaron Tilley's Blog",
        href: 'https://aarontilley.me/rss.xml',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <div>
      <HeadContent />
      <Navbar />
      <PageTransition />
    </div>
  )
}
