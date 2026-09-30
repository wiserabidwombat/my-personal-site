import { Buffer } from 'buffer'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import './halloween.css'
import App from './App.tsx'
import { router } from './appRouter'

declare global {
  interface Window {
    Buffer?: typeof Buffer
  }
}

// gray-matter (used by src/lib/blog.ts to parse markdown frontmatter) calls
// the Node.js global `Buffer` directly. The browser has no such global, so
// without this polyfill every blog route throws "Buffer is not defined".
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer
}

const rootElement = document.getElementById('root')!
const appTree = (
  <StrictMode>
    <App />
  </StrictMode>
)

// scripts/prerender-meta.mjs bakes each route's actual rendered body into
// dist/<route>/index.html, so #root already has real markup on a
// prerendered/static load -- hydrateRoot attaches to that instead of
// discarding and re-rendering it (which createRoot always does, even over
// existing markup), avoiding a blank-then-repaint flash on first load.
// `vite dev` serves index.html's own always-empty `<div id="root"></div>`
// verbatim, so this falls through to the original createRoot() there --
// dev keeps working completely unchanged.
//
// Hydration only works if the first client render matches that markup
// exactly; otherwise React throws error #418 and re-renders the whole page
// (which, among other things, makes every loading="lazy" image download at
// once). So, as TanStack Router's own SSR hydration does:
//  - router.ssr marks the markup as server-rendered, so the router renders
//    its matches without the <Suspense> wrapper it only adds for pure
//    client renders (the prerender, rendering "on the server", has none);
//  - router.load() first loads the matched route's code-split component and
//    loader data, so nothing suspends mid-hydration.
if (rootElement.hasChildNodes()) {
  router.ssr = { manifest: undefined }
  router.load().then(() => hydrateRoot(rootElement, appTree))
} else {
  createRoot(rootElement).render(appTree)
}
