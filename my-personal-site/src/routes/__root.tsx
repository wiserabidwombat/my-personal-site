import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Navbar } from '../components/navbar'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div>
      <h1>Welcome to my personal site!</h1>
      <Navbar />
      <Outlet />
    </div>
  )
}
