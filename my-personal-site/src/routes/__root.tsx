import * as React from 'react'
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <React.Fragment>
      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/about">About</Link>
        {' | '}
        <Link to="/games">Games</Link>
        {' | '}
        <Link to="/minerals_fossils">Minerals & Fossils</Link>
        {' | '}
        <Link to="/resume">Resume</Link>
      </nav>
      <Outlet />
    </React.Fragment>
  )
}
