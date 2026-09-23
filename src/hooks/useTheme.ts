import { createContext, createElement, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

function getInitialTheme(): Theme {
  // index.html's inline script already sets this attribute before React
  // even loads, so reading it back keeps this hook in sync with that single
  // source of truth instead of re-deriving the choice a second way.
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
}

// A plain useState-per-call hook can't be shared across components -- each
// caller would get its own independent copy, so toggling in one place (the
// navbar) would never be reflected anywhere another component reads theme
// (e.g. Home's dark/light hero swap). Context makes every consumer read the
// same value and re-render together.
const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Private browsing / storage disabled -- theme still applies for this
      // page view, it just won't persist across visits.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return createElement(ThemeContext.Provider, { value: { theme, toggleTheme } }, children)
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
