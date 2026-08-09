import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <React.Fragment>
      <nav>
        <a href="/">Home</a>
        {' | '}
        <a href="/about">About</a>
      </nav>
      <div>Hello "__root"!</div>
      <Outlet />
    </React.Fragment>
  )
}
