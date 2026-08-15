import { Navbar } from '../components/navbar'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen text-slate-100 relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0" />
      <header className="sticky top-0 z-30 border-b border-transparent bg-transparent backdrop-blur-md">
        <Navbar />
      </header>

      <main className="flex-1 py-10 relative z-10">
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
