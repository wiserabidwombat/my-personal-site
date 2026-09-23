import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// Extracted from App.tsx so scripts/prerender-meta.mjs can build its own
// router instance per route -- one backed by a fresh createMemoryHistory()
// (rather than the browser's real history) so it can render each route in
// isolation under Node with no <window>/<document> -- while App.tsx keeps
// using the real browser history it always has. `history` is optional and
// left undefined for App.tsx's call, which is exactly what createRouter()
// itself defaults to (a browser history), so this is a pure extraction with
// zero behavior change for the actual deployed app.
export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, history })
}
