import { createContext, createElement, useCallback, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { updateThemeColor } from '../lib/season'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

// The theme lives on <html data-theme>: index.html's inline script sets it
// before first paint, and all theme-dependent styling is CSS keyed off it.
// This hook just follows that attribute (like useSeason follows
// data-season), so every component re-renders together when it changes.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

const getSnapshot = (): Theme => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')

// The prerendered HTML (scripts/prerender-meta.mjs, which has no DOM) is
// always rendered dark. During hydration React uses this same value, so the
// first client render matches that markup; right after, it re-renders with
// the real attribute, fixing theme-dependent attributes like the toggle's
// aria-label. (Reading the attribute during that first render instead is
// a hydration mismatch React never patches.)
const getServerSnapshot = (): Theme => 'dark'

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
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleTheme = useCallback(() => {
    const next: Theme = getSnapshot() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    updateThemeColor()
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private browsing / storage disabled -- theme still applies for this
      // page view, it just won't persist across visits.
    }
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
