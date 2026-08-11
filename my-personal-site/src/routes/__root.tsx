import * as React from 'react'
import { Navbar } from '../components/navbar'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar sits cleanly at the top */}
      <header className="w-full border-b bg-background">
        <Navbar />
      </header>
      
      {/* Outlet content fills everything else */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
