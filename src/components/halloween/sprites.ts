import type { SpriteArt } from './PixelSprite'

// Halloween palette (fixed colors, so each sprite reads the same on the dark
// and light backgrounds; the outline handles contrast on light).
const NIGHT = '#24112e'
const OUTLINE = '#3b1f4a'
const GHOST = '#f1ecfa'
const BONE = '#efe6d8'
const EYE = '#ff7a1a'

// Adds a 1-pixel rim light along the top edge of a sprite's body: every
// body pixel with nothing above it becomes the rim color. Used for the dark
// theme, where a dark bat would otherwise vanish against the night sky.
function withTopRim(art: SpriteArt, body: string, rimColor: string, extraColors: Record<string, string> = {}): SpriteArt {
  const rows = art.rows.map((row, y) =>
    [...row].map((char, x) => (char === body && (y === 0 || art.rows[y - 1][x] === '.') ? 'L' : char)).join(''),
  )
  return { ...art, rows, colors: { ...art.colors, L: rimColor, ...extraColors } }
}

// Bat, two frames (wings up / wings down) for the flap.
export const batUp: SpriteArt = {
  rows: [
    'X...........X',
    'XX..X...X..XX',
    'XXX.XXXXX.XXX',
    'XXXXXOXOXXXXX',
    '.XXXXXXXXXXX.',
    '..X.XXXXX.X..',
    '......X......',
  ],
  colors: { X: NIGHT, O: EYE },
}

export const batDown: SpriteArt = {
  rows: [
    '....X...X....',
    '....XXXXX....',
    '..XXXOXOXXX..',
    '.XXXXXXXXXXX.',
    'XXX.XXXXX.XXX',
    'XX...XXX...XX',
    'X.....X.....X',
  ],
  colors: { X: NIGHT, O: EYE },
}

// Dark-theme bats: a rim light in the Halloween purple along the wings and
// head, and eyes in the orange token at full strength.
const nightBat = (art: SpriteArt) => withTopRim(art, 'X', 'var(--cyber-purple)', { O: 'var(--neon-pink)' })
export const batUpNight = nightBat(batUp)
export const batDownNight = nightBat(batDown)

export const ghost: SpriteArt = {
  rows: [
    '....WWWW....',
    '..WWWWWWWW..',
    '.WWWWWWWWWW.',
    '.WWDDWWDDWW.',
    'WWWDDWWDDWWW',
    'WWWWWWWWWWWW',
    'WWWWWDDWWWWW',
    'WWWWWDDWWWWW',
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    'WWWWWWWWWWWW',
    'WW.WWW.WWW.W',
    'W...W...W...',
  ],
  colors: { W: GHOST, D: NIGHT },
  outline: OUTLINE,
}

export const skeleton: SpriteArt = {
  rows: [
    '..BBBBB..',
    '.BBBBBBB.',
    '.BDBBBDB.',
    '.BBBDBBB.',
    '..BDBDB..',
    '...BBB...',
    '....B....',
    '.BBBBBBB.',
    'B.BBBBB.B',
    'B..BBB..B',
    'B.BBBBB.B',
    '...BBB...',
    '....B....',
    '...B.B...',
    '..B...B..',
    '..B...B..',
    '.BB...BB.',
  ],
  colors: { B: BONE, D: NIGHT },
  outline: OUTLINE,
}

export { jackOLantern } from './pumpkins'
