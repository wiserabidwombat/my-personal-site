import { Buffer } from 'buffer'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.tsx'

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
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, appTree)
} else {
  createRoot(rootElement).render(appTree)
}
