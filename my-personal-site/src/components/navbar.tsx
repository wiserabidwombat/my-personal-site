import { Link } from '@tanstack/react-router'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/games', label: 'Games' },
  { to: '/minerals_fossils', label: 'Minerals & Fossils' },
  { to: '/resume', label: 'Resume' }
]

export function Navbar() {
  return (
    <nav>
        {navItems.map((item, index) => (
            <span key={item.to}>
                <Link to={item.to}>{item.label}</Link>
                {index < navItems.length - 1 && ' | '}
            </span>
        ))}
    </nav>
  )
}