import { createRootRoute, HeadContent } from '@tanstack/react-router'
import { Navbar } from '../components/navbar'
import { PageTransition } from '../components/PageTransition'
import { Footer } from '../components/Footer'
import { ThemeProvider } from '../hooks/useTheme'
import { seoMeta, SITE_URL } from '../lib/meta'

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
    // No canonical <link> here on purpose -- every leaf route supplies its
    // own via canonicalLink() (src/lib/meta.ts), and TanStack Router's
    // dedup behavior for `links` (unlike `meta`, which it explicitly
    // merges/overrides by name) isn't confirmed, so adding one here risks
    // two canonical tags on every page instead of one.
    links: [
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: "Aaron Tilley's Blog",
        href: `${SITE_URL}/rss.xml`,
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  // scripts/prerender-meta.mjs sets `globalThis.__PRERENDERING__` before its
  // Node-side renderToString() pass (see that script's renderBody()) so this
  // component tree renders WITHOUT <HeadContent/> there. That script's own
  // renderHead() already independently builds the exact same title/meta/
  // canonical tags from the same seoMeta()/canonicalLink() inputs, so
  // <HeadContent/>'s output during that pass is pure duplication -- and
  // React 19 auto-hoists <title>/<meta>/<link> tags to the front of whatever
  // string renderToString() returns, which prerender-meta.mjs splices
  // straight into <body>. Left unguarded, that bakes a second, invalid copy
  // of every head tag -- including a second canonical <link> -- into every
  // static page. Every real browser render (initial hydration AND every
  // client-side route change) never sets this flag, so <HeadContent/> keeps
  // rendering there exactly as before, which is what keeps per-route
  // titles/meta correct as the user navigates.
  const isPrerendering = (globalThis as { __PRERENDERING__?: boolean }).__PRERENDERING__ === true

  return (
    // flex-col + min-h-screen here (not relying on individual page wrappers'
    // own min-h-screen, which were all removed) is what pins Footer to the
    // viewport bottom on short pages while still letting it scroll below
    // long ones: main grows via flex-1 to fill any leftover space, so the
    // footer only ever sits right after real content or at the screen's
    // bottom edge, never floating mid-page.
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        {!isPrerendering && <HeadContent />}
        <Navbar />
        <main className="flex-1">
          <PageTransition />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
