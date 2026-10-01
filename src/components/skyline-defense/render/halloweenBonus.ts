import { batDown, batUp } from '../../halloween/sprites'
import { ufoHitRadius } from '../game/bonus'
import type { Scout, Ufo } from '../game/types'
import { alpha, type Palette } from './palette'
import { drawPixelArt, farthestCorner } from './pixelArt'

// The bonus targets during Halloween (drawing only; hitboxes, paths and
// points are the normal UFO's and scouts'): the UFO is a witch on a
// broomstick and the scouts are bats. Both stay in the bonus color
// (palette.lime, violet in season), apart from the green buildings and the
// yellow meteors.

// Facing right; mirrored when flying left. V: bonus violet, v: shade, F:
// face and hands, D: eye, T: broom handle, O: bristles.
export const WITCH_ROWS = [
  '...VV...........',
  '....VV..........',
  '....VVV.........',
  '.....VVV........',
  '....VVVVV.......',
  '..VVVVVVVVV.....',
  '.....vvFDF......',
  '.....vFFFFF.....',
  '....vVVVV.......',
  '.O.VVVVVVV......',
  'OOVVVVVVVVFF....',
  'OOOTTTTTTTTTTTT.',
  'OO.....VVv......',
  '........vvv.....',
]
const WITCH_SHADE = '#5a2a85'
const BROOM_HANDLE = '#c9a26b'

// Pixels per cell for a witch exactly as big as the UFO's hit circle, so no
// part of her is outside what a blast has to reach.
export function witchPixel(ufo: Ufo): number {
  return ufoHitRadius(ufo) / farthestCorner(WITCH_ROWS)
}

// A few sparkles trailing behind the bristles, as fractions of the UFO's
// size: [behind, below, twinkle phase]. Each star, arms included, stays
// within 0.5 x size of the center, the edge of the old saucer, so the
// target looks no bigger than before.
const SPARKLES: [number, number, number][] = [
  [0.33, 0.06, 0],
  [0.38, 0.17, 2.1],
  [0.42, 0.1, 4.2],
]

function drawSparkles(ctx: CanvasRenderingContext2D, ufo: Ufo, pixel: number, dir: number, palette: Palette, still: boolean) {
  const s = ufo.size
  SPARKLES.forEach(([behind, below, phase], i) => {
    const x = ufo.pos.x - dir * behind * s
    const y = ufo.pos.y + below * s
    const twinkle = still ? 0.8 - i * 0.15 : 0.35 + 0.65 * Math.abs(Math.sin(ufo.age * 7 + phase))
    ctx.fillStyle = alpha(i % 2 === 0 ? palette.lime : palette.text, twinkle)
    // A small four-point star: a center pixel and four arms.
    ctx.beginPath()
    ctx.rect(x - pixel / 2, y - pixel * 1.5, pixel, pixel * 3)
    ctx.rect(x - pixel * 1.5, y - pixel / 2, pixel * 3, pixel)
    ctx.fill()
  })
}

export function drawWitch(ctx: CanvasRenderingContext2D, ufo: Ufo, palette: Palette, still: boolean) {
  const dir = ufo.vx < 0 ? -1 : 1
  const pixel = witchPixel(ufo)
  ctx.save()
  ctx.shadowColor = palette.lime
  ctx.shadowBlur = 8
  drawSparkles(ctx, ufo, pixel, dir, palette, still)
  drawPixelArt(
    ctx,
    WITCH_ROWS,
    { V: palette.lime, v: WITCH_SHADE, F: palette.text, D: palette.dark, T: BROOM_HANDLE, O: palette.pink },
    ufo.pos.x,
    ufo.pos.y,
    pixel,
    dir < 0,
  )
  ctx.restore()
}

// The Home page's bat (src/components/halloween/sprites.ts), with its wings
// spanning the scout's size, flapping between its two frames; one held
// frame under reduced motion.
export function drawBat(ctx: CanvasRenderingContext2D, scout: Scout, palette: Palette, still: boolean) {
  const frame = !still && Math.floor(scout.age * 6 + scout.phase) % 2 === 1 ? batDown : batUp
  const pixel = scout.size / Math.max(...frame.rows.map((row) => row.length))
  ctx.save()
  ctx.shadowColor = palette.lime
  ctx.shadowBlur = 6
  drawPixelArt(ctx, frame.rows, { X: palette.lime, O: palette.pink }, scout.pos.x, scout.pos.y, pixel)
  ctx.restore()
}
