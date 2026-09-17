import { createRootRoute, HeadContent } from '@tanstack/react-router'
import { Navbar } from '../components/navbar'
import { PageTransition } from '../components/PageTransition'
import { Footer } from '../components/Footer'
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
    // flex-col + min-h-screen here (not relying on individual page wrappers'
    // own min-h-screen, which were all removed) is what pins Footer to the
    // viewport bottom on short pages while still letting it scroll below
    // long ones: main grows via flex-1 to fill any leftover space, so the
    // footer only ever sits right after real content or at the screen's
    // bottom edge, never floating mid-page.
    <div className="flex min-h-screen flex-col">
      <HeadContent />
      <Navbar />
      <main className="flex-1">
        <PageTransition />
      </main>
      <Footer />
    </div>
  )
}
