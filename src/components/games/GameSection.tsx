import type { ReactNode } from 'react'
import type { IconSvgElement } from '@hugeicons/react'
import { cn } from 'cn'
import { SectionHeading } from '../SectionHeading'
import { pageContainer } from '../../lib/styles'

type Props = {
  icon: IconSvgElement
  title: string
  description?: string
  // Rendered on the heading's line, right-aligned (e.g. "Live from Notion").
  aside?: ReactNode
  children: ReactNode
}

// Every Games section uses the site's shared container and left edge, the
// About/Resume section heading (accent icon, no glow), and the same modest
// vertical rhythm.
export function GameSection({ icon, title, description, aside, children }: Props) {
  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <SectionHeading icon={icon}>{title}</SectionHeading>
        {aside}
      </div>
      {description && <p className="mt-2 text-slate-300">{description}</p>}
      {children}
    </section>
  )
}
