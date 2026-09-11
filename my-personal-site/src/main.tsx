import { Buffer } from 'buffer'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
