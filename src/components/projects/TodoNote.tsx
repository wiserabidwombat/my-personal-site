import type { ReactNode } from 'react'
import { cn } from 'cn'

type Props = {
  children: ReactNode
  className?: string
}

// A visible "TODO" marker for content that still needs Aaron's
// confirmation. Rendered on the page on purpose, so an unconfirmed draft
// can't ship without anyone noticing.
export function TodoNote({ children, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-[var(--neon-pink)]/60 px-4 py-3 text-sm leading-relaxed text-slate-300',
        className,
      )}
    >
      <span className="mr-2 text-xs font-semibold tracking-wider text-[var(--neon-pink)] uppercase">TODO</span>
      {children}
    </div>
  )
}
