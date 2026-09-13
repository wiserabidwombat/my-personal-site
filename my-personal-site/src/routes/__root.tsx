import { Outlet, createRootRoute, HeadContent } from '@tanstack/react-router'
import { Navbar } from '../components/navbar'
import { pageTitle } from '../lib/title'

export const Route = createRootRoute({
  head: () => ({
    meta: [{ title: pageTitle() }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <div>
      <HeadContent />
      <Navbar />
      <Outlet />
    </div>
  )
}
