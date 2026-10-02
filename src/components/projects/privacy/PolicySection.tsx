import type { ReactNode } from 'react'
import type { IconSvgElement } from '@hugeicons/react'
import { SectionHeading } from '../../SectionHeading'

// Inline links in the policy text.
export const policyLink =
  'font-medium text-[var(--laser-cyan)] underline underline-offset-4 transition-colors hover:text-[var(--neon-pink)]'

// Bold lead-ins and emphasis in the policy text.
export const policyStrong = 'font-semibold text-slate-50'

// Bulleted lists in the policy text.
export const policyList = 'flex list-disc flex-col gap-2 pl-5 marker:text-[var(--laser-cyan)]'

type Props = {
  icon: IconSvgElement
  title: string
  children: ReactNode
}

// One section of the privacy policy: the site's left-aligned section
// heading (accent icon, no glow) over its prose. The page caps the prose
// width.
export function PolicySection({ icon, title, children }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading icon={icon}>{title}</SectionHeading>
      {children}
    </section>
  )
}
