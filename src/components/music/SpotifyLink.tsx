import type { ReactNode } from 'react'
import { cn } from 'cn'

type Props = {
  href: string | null
  className?: string
  title?: string
  children: ReactNode
}

const focusClass =
  'focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-space-black)] focus-visible:outline-none'

// Every piece of Spotify content links back to its Spotify page (a
// requirement of Spotify's branding guidelines), in a new tab. Without a URL
// it renders the same content, unlinked.
export function SpotifyLink({ href, className, title, children }: Props) {
  if (!href) {
    return (
      <div className={className} title={title}>
        {children}
      </div>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title} className={cn(focusClass, className)}>
      {children}
      <span className="sr-only"> (listen on Spotify, opens in a new tab)</span>
    </a>
  )
}
