import { useSyncExternalStore } from 'react'

// Mounts/unmounts based on a real matchMedia result rather than a CSS-only
// hidden/sm:hidden toggle -- important for NeonShowcase's mobile carousel,
// since Embla measures slide widths on mount and a ResizeObserver won't
// reliably catch a parent flipping from display:none to visible when a
// desktop window is resized across the breakpoint.
//
// useSyncExternalStore (not useState+useEffect) because matchMedia is
// exactly the kind of external, subscribable browser API it's designed
// for -- it reads the current value directly during render instead of
// syncing state from an effect after the fact.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQueryList = window.matchMedia(query)
      mediaQueryList.addEventListener('change', onChange)
      return () => mediaQueryList.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}
