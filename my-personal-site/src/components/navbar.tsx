import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../../@/components/ui/navigation-menu'

const primaryNavItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/resume', label: 'Resume' },
]

const hobbyItems = [
  { to: '/games', label: 'Games' },
  { to: '/minerals_fossils', label: 'Minerals & Fossils' },
]

const navLinkClass =
  'text-sm font-medium text-slate-200 transition-colors duration-300 hover:text-[var(--laser-cyan)] hover:[text-shadow:var(--glow-cyan)]'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--neon-pink)] bg-[var(--deep-space-black)]/80 shadow-[0_2px_16px_-4px_var(--neon-pink)] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link
          to="/"
          className="text-lg font-bold tracking-widest text-[var(--laser-cyan)] [text-shadow:var(--glow-cyan)]"
        >
          AARON TILLEY
        </Link>

        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="gap-1">
            {primaryNavItems.map((item) => (
              <NavigationMenuItem key={item.to}>
                <Link to={item.to} className={`${navLinkClass} block rounded-2xl px-4.5 py-2.5`}>
                  {item.label}
                </Link>
              </NavigationMenuItem>
            ))}

            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`bg-transparent hover:bg-transparent focus:bg-transparent ${navLinkClass}`}
              >
                Hobbies
              </NavigationMenuTrigger>
              <NavigationMenuContent className="border border-[var(--laser-cyan)]/30 shadow-glow-cyan">
                <ul className="flex min-w-40 flex-col gap-1">
                  {hobbyItems.map((item) => (
                    <li key={item.to}>
                      <NavigationMenuLink
                        closeOnClick
                        render={<Link to={item.to} />}
                        className={`${navLinkClass} block rounded-xl px-3 py-2`}
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className="text-[var(--laser-cyan)] md:hidden"
        >
          <HugeiconsIcon icon={mobileOpen ? Cancel01Icon : Menu01Icon} size={26} />
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--laser-cyan)]/30 bg-[var(--deep-space-black)] px-6 py-3 text-left md:hidden">
          <ul className="flex flex-col gap-1">
            {primaryNavItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`${navLinkClass} block rounded-xl px-3 py-2.5`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 px-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Hobbies
            </li>
            {hobbyItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`${navLinkClass} block rounded-xl px-3 py-2.5 pl-6`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
