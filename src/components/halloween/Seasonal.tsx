import { lazy, Suspense } from 'react'
import { useSeason } from '../../hooks/useSeason'

// The sprite module is split into its own chunk and imported only when the
// season is active, so outside October it's never downloaded.
const loadDecor = () => import('./HalloweenDecor')
const decor = {
  heroBats: lazy(() => loadDecor().then((module) => ({ default: module.HeroBats }))),
  peekingGhost: lazy(() => loadDecor().then((module) => ({ default: module.PeekingGhost }))),
  headingSkeleton: lazy(() => loadDecor().then((module) => ({ default: module.HeadingSkeleton }))),
  footerPumpkin: lazy(() => loadDecor().then((module) => ({ default: module.FooterPumpkin }))),
}

// Renders one Halloween sprite placement while the season is active, and
// nothing otherwise (including during prerendering).
export function Seasonal({ sprite }: { sprite: keyof typeof decor }) {
  const { active } = useSeason()
  if (!active) return null
  const Sprite = decor[sprite]
  return (
    <Suspense fallback={null}>
      <Sprite />
    </Suspense>
  )
}
