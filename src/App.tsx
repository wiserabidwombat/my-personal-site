import { RouterProvider } from '@tanstack/react-router'
import { createAppRouter } from './router'

// No history argument -- createAppRouter() (src/router.ts) defaults to
// createRouter()'s own browser history, same as before this was extracted.
const router = createAppRouter()

function App() {
  return <RouterProvider router={router} />
}

export default App
