import { Link } from '@tanstack/react-router'
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
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--neon-pink)] bg-[var(--deep-space-black)]/80 shadow-[0_2px_16px_-4px_var(--neon-pink)] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link
          to="/"
          className="text-lg font-bold tracking-widest text-[var(--laser-cyan)] [text-shadow:var(--glow-cyan)]"
        >
          AARON TILLEY
        </Link>

        <NavigationMenu>
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
      </div>
    </header>
  )
}
