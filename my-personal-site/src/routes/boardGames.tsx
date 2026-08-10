import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/boardGames')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/boardGames"!</div>
}
