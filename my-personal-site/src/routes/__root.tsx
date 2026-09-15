import { createRootRoute, HeadContent } from '@tanstack/react-router'
import { Navbar } from '../components/navbar'
import { PageTransition } from '../components/PageTransition'
import { pageTitle } from '../lib/title'

export const Route = createRootRoute({
  head: () => ({
    meta: [{ title: pageTitle() }],
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
