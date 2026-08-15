import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

const navItems = [
  { to: '/', label: 'Home', color: 'pink' },
  { to: '/about', label: 'About', color: 'purple' },
  { to: '/resume', label: 'Resume', color: 'cyan' },
  { to: '/boardGames', label: 'Board Games', color: 'teal' },
  { to: '/fossilsMinerals', label: 'Fossils & Minerals', color: 'amber' },
  { to: '/books', label: 'Books', color: 'magenta' },
]

export function Navbar() {
  const [font, setFont] = useState<'orbitron' | 'pastor'>(() => {
    try {
      return (localStorage.getItem('site-font') as 'orbitron' | 'pastor') || 'orbitron'
    } catch {
      return 'orbitron'
    }
  })

  useEffect(() => {
    if (font === 'pastor') document.documentElement.setAttribute('data-font', 'pastor')
    else document.documentElement.removeAttribute('data-font')
    try { localStorage.setItem('site-font', font) } catch {}
  }, [font])
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm sm:px-8">
      <Link to="/" className="site-title text-2xl tracking-tight">
        My Personal Site
      </Link>

      <nav className="flex flex-wrap items-center gap-3">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`neon-link neon-${item.color} rounded-full px-4 py-2 text-sm font-medium neon-flicker`}
          >
            <span className="block transform transition-all hover:scale-105">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => setFont((f) => (f === 'orbitron' ? 'pastor' : 'orbitron'))}
          title="Toggle font"
          className="ml-2 rounded-md border border-slate-700/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/60"
        >
          {font === 'orbitron' ? 'Pastor' : 'Orbitron'}
        </button>
      </nav>
    </div>
  )
}
