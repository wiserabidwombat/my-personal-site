import type { ReactNode } from 'react'
import { cn } from 'cn'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

type Target =
  | { href: string; external?: boolean; onClick?: never; busy?: never }
  | { onClick: () => void; busy?: boolean; href?: never; external?: never }

type Props = Target & {
  icon: IconSvgElement
  title: string
  subtitle: string
  // An extra control (e.g. a copy button) layered above the card's
  // full-card link/button rather than nested inside it.
  action?: ReactNode
  className?: string
}

// Same look as the Blog cards: one border color, slight lift + brighter
// border on hover or keyboard focus, and a visible focus ring. The whole
// card is clickable via a "stretched" link/button (its ::after covers the
// card), so a secondary control can sit above it as a sibling -- never
// nested inside the link, which would be invalid HTML.
const targetClass =
  'card-target flex min-w-0 flex-col text-left after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[var(--laser-cyan)] focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-[var(--deep-space-black)] disabled:cursor-wait'

export function ContactCard({ icon, title, subtitle, action, className, ...target }: Props) {
  const text = (
    <>
      <span className="text-base font-bold text-slate-50">{title}</span>
      <span className="truncate text-sm text-slate-400 transition-colors duration-300 group-hover:text-[var(--laser-cyan)]">
        {subtitle}
      </span>
    </>
  )

  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 px-6 py-5 transition duration-300',
        'hover:-translate-y-1 hover:border-[var(--laser-cyan)]/70 motion-reduce:hover:translate-y-0',
        'has-[.card-target:focus-visible]:-translate-y-1 has-[.card-target:focus-visible]:border-[var(--laser-cyan)]/70',
        className,
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--deep-space-black)] ring-1 ring-[var(--laser-cyan)]/40">
        <HugeiconsIcon icon={icon} strokeWidth={2} className="size-6 text-[var(--laser-cyan)]" aria-hidden="true" />
      </span>
      {target.href !== undefined ? (
        <a
          href={target.href}
          target={target.external ? '_blank' : undefined}
          rel={target.external ? 'noopener noreferrer' : undefined}
          className={targetClass}
        >
          {text}
          {target.external && <span className="sr-only"> (opens in a new tab)</span>}
        </a>
      ) : (
        <button type="button" onClick={target.onClick} disabled={target.busy} className={targetClass}>
          {text}
        </button>
      )}
      {action && <div className="relative z-10 ml-auto shrink-0">{action}</div>}
    </div>
  )
}
