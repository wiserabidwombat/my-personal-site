import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { gameCardBaseClass } from '../games/shared'

type Props = {
  icon: IconSvgElement
  label: string
  // Card link: a site path or a full URL. Without one the card is static.
  href?: string
  // Screen-reader name for the link, e.g. "Games page".
  linkLabel?: string
  loading?: boolean
  className?: string
  children?: ReactNode
}

// The card's link is stretched over the whole card (its ::after covers it),
// so the card is one click target without wrapping the content in an <a>.
// That leaves room for a separate inner link -- Now Listening's link to the
// track on Spotify -- which sits above the stretched link (relative z-10).
export function StatusCard({ icon, label, href, linkLabel, loading = false, className, children }: Props) {
  const linkClass = 'after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none'
  const external = href?.startsWith('http')

  return (
    <li
      className={cn(
        gameCardBaseClass,
        'relative flex-col p-5',
        href &&
          'hover:-translate-y-1 hover:border-[var(--laser-cyan)]/70 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-[var(--laser-cyan)] has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-[var(--deep-space-black)] motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-6 text-[var(--laser-cyan)]" aria-hidden="true" />
      <p className="mt-2 text-xs font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
        {href && !external && (
          <Link to={href} className={linkClass}>
            {label}
            {linkLabel && <span className="sr-only"> ({linkLabel})</span>}
          </Link>
        )}
        {href && external && (
          <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
        {!href && label}
      </p>
      <div className="mt-1.5 text-slate-200">
        {loading ? <div className="skeleton-shimmer mt-1 h-4 w-3/4 rounded-md" aria-hidden="true" /> : children}
      </div>
    </li>
  )
}
