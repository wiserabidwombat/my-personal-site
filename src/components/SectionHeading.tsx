import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { sectionHeading } from '../lib/styles'

type Props = {
  icon: IconSvgElement
  children: string
}

// Section heading below a hero (About, Resume): accent icon + neon-pink
// text, no glow.
export function SectionHeading({ icon, children }: Props) {
  return (
    <h2 className={sectionHeading}>
      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-6 text-[var(--neon-pink)]" aria-hidden="true" />
      {children}
    </h2>
  )
}
