// Single source of truth for each static route's SEO metadata args -- the
// object every route file below passes straight into seoMeta()/uses to build
// its canonicalLink() (see src/lib/meta.ts) inside its own head(). Route
// files import their entry from here instead of typing the title/description
// literal inline, and scripts/prerender-meta.mjs's static-page prerender pass
// imports the very same `routeMetaList` -- so there is no second, hand-typed
// copy of any title/description left anywhere that could silently drift out
// of sync with what a route actually renders. routeMeta.test.ts is the guard
// that keeps every route file actually wired to its entry here (rather than
// quietly falling back to an inline literal that bypasses this module).
//
// Deliberately dependency-free (no JSX, no path aliases, no asset imports)
// so it -- unlike the route .tsx files themselves, which pull in the full
// UI/component graph -- loads cleanly under both scripts/prerender-meta.mjs's
// Vite SSR module loader AND Vitest's plain Node environment.
export type RouteMetaEntry = {
  path: string
  // Passed through pageTitle() for the "X | Aaron Tilley" format; omit for
  // the home page, matching seoMeta()'s own convention (src/lib/meta.ts).
  title?: string
  description: string
}

export const homeMeta: RouteMetaEntry = {
  path: '/',
  description: 'Senior Developer specializing in React, .NET, and enterprise CRM systems.',
}

export const aboutMeta: RouteMetaEntry = {
  path: '/about',
  title: 'About',
  description: 'Senior Developer specializing in React, .NET, and enterprise CRM systems.',
}

export const resumeMeta: RouteMetaEntry = {
  path: '/resume',
  title: 'Resume',
  description: "View Aaron Tilley's professional experience and technical skills.",
}

export const blogMeta: RouteMetaEntry = {
  path: '/blog',
  title: 'Blog',
  description:
    'Notes on code, engineering leadership, and everything in between -- Aaron Tilley writes about software development, teams, and AI-assisted workflows.',
}

export const gamesMeta: RouteMetaEntry = {
  path: '/games',
  title: 'Game Inventory',
  description: "Browse Aaron's board game collection.",
}

export const contactMeta: RouteMetaEntry = {
  path: '/contact',
  title: 'Contact',
  description: 'Get in touch with Aaron Tilley -- reach out by email or connect on LinkedIn.',
}

export const stackMeta: RouteMetaEntry = {
  path: '/stack',
  title: 'About This Site',
  description: 'The tools and technology stack behind this site.',
}

export const mineralsFossilsMeta: RouteMetaEntry = {
  path: '/minerals_fossils',
  title: 'Minerals & Fossils',
  description: "Browse Aaron's minerals and fossil collection.",
}

export const musicMeta: RouteMetaEntry = {
  path: '/music',
  title: 'Music',
  description: "What Aaron's listening to lately -- top artists and tracks, playlists, and podcasts, live from Spotify.",
}

export const booksMeta: RouteMetaEntry = {
  path: '/books',
  title: "Books I've Read",
  description: "Browse Aaron's reading library, synced live from Hardcover.",
}

// Consumed directly by scripts/prerender-meta.mjs for its static-page
// prerender pass (see that script's comments). Order here has no effect on
// the prerendered output -- each page is written to its own
// dist/<path>/index.html -- it just controls prerender log/loop order.
export const routeMetaList: readonly RouteMetaEntry[] = [
  homeMeta,
  aboutMeta,
  resumeMeta,
  blogMeta,
  gamesMeta,
  contactMeta,
  stackMeta,
  mineralsFossilsMeta,
  booksMeta,
  musicMeta,
]
