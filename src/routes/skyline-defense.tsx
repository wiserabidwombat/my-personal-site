import { createFileRoute } from '@tanstack/react-router'
import { SkylineDefensePage } from '../components/skyline-defense/SkylineDefensePage'
import { seoMeta } from '../lib/meta'

// Hidden Easter egg, reached from Reunion Tower on the home page skyline.
// Not in the nav or routeMeta.ts's prerender list, and noindex. The
// router plugin's autoCodeSplitting puts the component (and the whole
// game) in its own chunk, loaded only when this route is visited.
export const Route = createFileRoute('/skyline-defense')({
  staticData: { bareLayout: true },
  head: () => ({
    meta: seoMeta({
      title: 'Skyline Defense',
      description: 'Defend the Dallas skyline from falling meteors.',
      path: '/skyline-defense',
      noindex: true,
    }),
  }),
  component: SkylineDefensePage,
})
