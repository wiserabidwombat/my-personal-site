import { cn } from 'cn'
import { outlinePill } from '../lib/styles'

type Props = {
  children: string
}

// Non-interactive outlined pill -- skill pills on About, tag pills on blog
// cards. Kept separate from the shared shadcn Badge (used in 18+ other
// files with a filled style) rather than restyling it.
export function OutlinePill({ children }: Props) {
  return <span className={cn(outlinePill, 'hover:bg-[var(--laser-cyan)]/10')}>{children}</span>
}
