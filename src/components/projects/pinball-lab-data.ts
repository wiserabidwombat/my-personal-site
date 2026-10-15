import pinballCthulhu400 from '../../assets/projects/pinball-cthulhu-rising-400.webp'
import pinballCthulhu600 from '../../assets/projects/pinball-cthulhu-rising-600.webp'
import pinballGrey400 from '../../assets/projects/pinball-grey-invasion-400.webp'
import pinballGrey600 from '../../assets/projects/pinball-grey-invasion-600.webp'
import pinballOrbit400 from '../../assets/projects/pinball-orbit-400.webp'
import pinballOrbit600 from '../../assets/projects/pinball-orbit-600.webp'
import pinballTables400 from '../../assets/projects/pinball-tables-400.webp'
import pinballTables600 from '../../assets/projects/pinball-tables-600.webp'
import { portrait, type Screenshot } from './projects-data'

// The Pinball Lab detail page's content. The card entry itself
// (`pinballLab`) lives with the other projects in projects-data.ts.

// TODO: there's no public TestFlight link for Pinball Lab yet. Set it here
// and the hero's "Join the TestFlight beta" button becomes a live link.
export const PINBALL_LAB_TESTFLIGHT_URL: string | undefined = undefined

export interface PinballTable {
  number: string
  name: string
  text: string
}

export const pinballTables: readonly PinballTable[] = [
  {
    number: '01',
    name: 'Orbit Pinball',
    text: 'Where it started. One screen with flippers, planet bumpers, slingshots, drop targets, a wormhole, a skill shot and ball save.',
  },
  {
    number: '02',
    name: 'Grey Invasion',
    text: 'A table taller than the screen, with a camera that follows the ball. Two ramps, multiball, three waves of flying saucers and a Mothership finale. All the art is drawn in code, and a robot "Shot Lab" plays shots on its own to measure how hard each one is.',
  },
  {
    number: '03',
    name: 'Cthulhu Rising',
    text: 'Every part modelled and rendered in 3D in Blender. A clear ramp the ball climbs, a swaying Cthulhu toy, a spinner, a magnet and an up-kicker. A three-act story tuned with a game simulator that played thousands of games, and its own synthesized sound set.',
  },
]

// "How it's built" list items.
export const pinballBuildList: readonly string[] = [
  'SwiftUI + SpriteKit, no game engine. Runs at 120 fps on ProMotion iPhones.',
  'Table art rendered in Blender at a 22° oblique angle, so the art lines up with the physics.',
  'Sounds synthesized in Python (numpy), plus CC0 Kenney impact sounds.',
  'Python simulators and an in-app robot used to tune the rules and shot difficulty.',
  'Game controller support (Xbox, PlayStation, MFi).',
  'Built with Claude.',
]

export const pinballRequirements: readonly string[] = ['iPhone', 'iOS 27']

// TODO: the three gameplay screenshots show the app's debug overlay (the
// fps readout, plus "Lab v5" / "T3 M11" build lines on Grey Invasion and
// Cthulhu Rising). Recapture them with it hidden, drop them over the
// pinball-*.png masters and re-run `npm run images:projects`.
export const pinballScreenshots: readonly Screenshot[] = [
  {
    image: portrait(
      pinballTables400,
      pinballTables600,
      'Pinball Lab home screen listing its three tables, Orbit Pinball, Grey Invasion and Cthulhu Rising, each with a Play button.',
    ),
    caption: 'The tables',
  },
  {
    image: portrait(
      pinballOrbit400,
      pinballOrbit600,
      'Orbit Pinball: a neon blue space table with three planet bumpers, drop targets, slingshots and flippers.',
    ),
    caption: 'Orbit Pinball',
  },
  {
    image: portrait(
      pinballGrey400,
      pinballGrey600,
      'Grey Invasion: a farm field at night with flying saucer bumpers, two green ramps, a red barn and cows.',
    ),
    caption: 'Grey Invasion',
  },
  {
    image: portrait(
      pinballCthulhu400,
      pinballCthulhu600,
      'Cthulhu Rising: a dark green 3D-rendered table with a clear ramp, a wire ramp, three bumpers and a ritual circle.',
    ),
    caption: 'Cthulhu Rising',
  },
]
