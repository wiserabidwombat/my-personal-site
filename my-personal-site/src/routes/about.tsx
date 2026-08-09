import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutRouteComponent,
})

function AboutRouteComponent() {
  return <div>About page</div>
}
