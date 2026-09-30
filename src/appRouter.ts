import { createAppRouter } from './router'

// The app's one router (App.tsx renders it; main.tsx prepares it for
// hydration). No history argument -- createAppRouter() (src/router.ts)
// defaults to createRouter()'s own browser history.
export const router = createAppRouter()
