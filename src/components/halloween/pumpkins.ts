import type { SpriteArt } from './PixelSprite'

// Kept apart from the other sprites (which load lazily) because the navbar's
// theme toggle shows these in season: they're in the main bundle so the
// prerendered page paints the pumpkin before any JavaScript runs. A few
// hundred bytes.
const PUMPKIN = '#ff7a1a'
const PUMPKIN_DARK = '#c2530e'
const GLOW = '#ffd23f'
const STEM = '#3f7d20'
const OUTLINE = '#3b1f4a'

// Jack-o'-lantern (lit) and a plain pumpkin (unlit) for the light theme's
// toggle.
const litRows = [
  '.....G.....',
  '....GG.....',
  '..OOOOOOO..',
  '.OOOOOOOOO.',
  'OOYYOOOYYOO',
  'OOYYOOOYYOO',
  'OOOOOYOOOOO',
  'OYOYOYOYOYO',
  'OOYYYYYYYOO',
  '.OOOOOOOOO.',
  '..OOOOOOO..',
]

// Two curved ridges instead of a face.
const unlitRows = [
  '.....G.....',
  '....GG.....',
  '..OOROROO..',
  '.OOROOOROO.',
  'OOROOOOOROO',
  'OOROOOOOROO',
  'OOROOOOOROO',
  'OOROOOOOROO',
  'OOROOOOOROO',
  '.OOROOOROO.',
  '..OOROROO..',
]

export const jackOLantern: SpriteArt = {
  rows: litRows,
  colors: { O: PUMPKIN, Y: GLOW, G: STEM },
  outline: OUTLINE,
}

export const pumpkin: SpriteArt = {
  rows: unlitRows,
  colors: { O: PUMPKIN, R: PUMPKIN_DARK, G: STEM },
  outline: OUTLINE,
}
