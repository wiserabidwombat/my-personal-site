import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/fossilsMinerals')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/fossilsMinerals"!</div>
}
