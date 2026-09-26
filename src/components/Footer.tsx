import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { RssIcon } from '@hugeicons/core-free-icons'
import { HalloweenToggle } from './halloween/HalloweenToggle'
import { Seasonal } from './halloween/Seasonal'

export function Footer() {
  return (
    <footer className="border-t border-[var(--cyber-purple)]/30 bg-[var(--deep-space-purple)]/20 px-6 py-5">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
        <p className="flex items-center gap-1.5">
          <Seasonal sprite="footerPumpkin" />
          &copy; {new Date().getFullYear()} Aaron Tilley. All rights reserved.
        </p>
        <span aria-hidden="true" className="hidden text-[var(--cyber-purple)] sm:inline">
          &bull;
        </span>
        <Link to="/contact" className="transition-colors duration-300 hover:text-[var(--laser-cyan)]">
          Contact
        </Link>
        <a
          href="/rss.xml"
          aria-label="RSS feed"
          title="RSS feed"
          className="inline-flex items-center text-slate-400 transition-colors duration-300 hover:text-[var(--laser-cyan)] hover:[filter:drop-shadow(0_0_6px_var(--laser-cyan))]"
        >
          <HugeiconsIcon icon={RssIcon} strokeWidth={2} className="size-4" aria-hidden="true" />
        </a>
        <HalloweenToggle />
      </div>
    </footer>
  )
}
