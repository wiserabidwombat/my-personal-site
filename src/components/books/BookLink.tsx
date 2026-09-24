import type { ReactNode } from 'react'
import { cn } from 'cn'
import { gameCardBaseClass, gameCardInteractiveClass } from '../games/shared'

type Props = {
  href: string | null
  className?: string
  children: ReactNode
}

// A book card that links to the book's Hardcover page in a new tab, with
// the same restrained border, hover lift, and focus ring as the Board Games
// cards. Without a Hardcover URL it renders as a plain, non-interactive card.
export function BookLink({ href, className, children }: Props) {
  if (!href) return <div className={cn(gameCardBaseClass, className)}>{children}</div>

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(gameCardBaseClass, gameCardInteractiveClass, className)}
    >
      {children}
      <span className="sr-only"> (opens Hardcover in a new tab)</span>
    </a>
  )
}
