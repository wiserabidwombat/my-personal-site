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
        {' | '}
        <a href="/resume">Resume</a>
        {' | '}
        <a href="/boardGames">Board Games</a>
        {' | '}
        <a href="/fossilsMinerals">Fossils and Minerals</a>
        {' | '}
        <a href="/books">Books</a>
      </nav>
      <Outlet />
    </React.Fragment>
  )
}
