import { Link } from '@tanstack/react-router'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from '../../@/components/ui/navigation-menu'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/games', label: 'Games' },
  { to: '/minerals_fossils', label: 'Minerals & Fossils' },
  { to: '/resume', label: 'Resume' }
]

export function Navbar() {
  return (
    <NavigationMenu>
        <NavigationMenuList>
            {navItems.map((item, index) => (
                <NavigationMenuItem key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                    {index < navItems.length - 1 && ' | '}
                </NavigationMenuItem>
            ))}
        </NavigationMenuList>
    </NavigationMenu>
    )
}