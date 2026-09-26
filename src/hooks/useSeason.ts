import { useCallback, useSyncExternalStore } from 'react'
import {
  applySeasonChoice,
  isSeasonAvailable,
  readSeasonInputs,
  SEASON_ATTRIBUTE,
  syncSeasonAttribute,
} from '../lib/season'

export type SeasonState = {
  // The Halloween theme is on (<html data-season="halloween">).
  active: boolean
  // It's October, or a preview is on: the footer can offer on/off.
  available: boolean
  setEnabled: (enabled: boolean) => void
}

// Watches <html data-season> -- set before first paint by index.html's
// inline script, and changed later by setEnabled -- so every component
// re-renders together.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [SEASON_ATTRIBUTE] })
  return () => observer.disconnect()
}

// A string snapshot, so useSyncExternalStore can compare it by value.
function getSnapshot(): string {
  const active = document.documentElement.getAttribute(SEASON_ATTRIBUTE) === 'halloween'
  const available = isSeasonAvailable(readSeasonInputs())
  return `${active}|${available}`
}

// Prerendering has no document: seasonal elements render only after
// hydration, while the palette (pure CSS off data-season) is right from the
// first paint.
const getServerSnapshot = () => 'false|false'

export function useSeason(): SeasonState {
  const [active, available] = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).split('|')

  const setEnabled = useCallback((enabled: boolean) => {
    try {
      applySeasonChoice(enabled, new Date(), window.localStorage, window.sessionStorage)
    } catch {
      // Storage blocked (private mode): the change still applies to this page.
    }
    syncSeasonAttribute()
  }, [])

  return { active: active === 'true', available: available === 'true', setEnabled }
}
