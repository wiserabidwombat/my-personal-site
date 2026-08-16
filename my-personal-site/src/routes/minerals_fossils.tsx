import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/minerals_fossils')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/minerals_fossils"!</div>
}
