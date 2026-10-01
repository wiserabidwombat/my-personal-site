import { describe, expect, it } from 'vitest'
import { ufoHitRadius } from '../game/bonus'
import { TUNING } from '../game/tuning'
import type { Ufo } from '../game/types'
import { drawWitch, WITCH_ROWS, witchPixel } from './halloweenBonus'
import { SEASON_COLORS, type Palette } from './palette'
import { drawPixelArt } from './pixelArt'

type Rect = [number, number, number, number]

// A 2D context that records rect() calls and accepts everything else.
function recordingContext(rects: Rect[]): CanvasRenderingContext2D {
  const target: Record<string | symbol, unknown> = {
    rect: (x: number, y: number, w: number, h: number) => rects.push([x, y, w, h]),
  }
  return new Proxy(target, {
    get: (obj, key) => (key in obj ? obj[key] : () => {}),
    set: (obj, key, value) => {
      obj[key] = value
      return true
    },
  }) as unknown as CanvasRenderingContext2D
}

const farthest = (rects: Rect[], cx: number, cy: number) =>
  Math.max(
    ...rects.flatMap(([x, y, w, h]) => [
      Math.hypot(x - cx, y - cy),
      Math.hypot(x + w - cx, y - cy),
      Math.hypot(x - cx, y + h - cy),
      Math.hypot(x + w - cx, y + h - cy),
    ]),
  )

const palette: Palette = {
  season: 'halloween',
  sky: '#0c0710',
  skyHigh: '#1a0f22',
  pink: '#ff7a1a',
  cyan: '#7dff3a',
  purple: '#a45ee8',
  ...SEASON_COLORS.halloween,
}

const ufo = (size: number, vx: number): Ufo => ({ id: 1, pos: { x: 300, y: 120 }, vx, size, age: 1.3 })

describe('the Halloween witch', () => {
  it.each([
    [TUNING.ufoSizeMin, 1],
    [TUNING.ufoSizeMax, 1],
    [TUNING.ufoSizeMin, -1],
    [TUNING.ufoSizeMax, -1],
  ])('fits inside the UFO hit circle (size %i, direction %i)', (size, vx) => {
    const target = ufo(size, vx)
    const rects: Rect[] = []
    drawPixelArt(recordingContext(rects), WITCH_ROWS, { V: 'v', v: 'v', F: 'f', D: 'd', T: 't', O: 'o' }, 300, 120, witchPixel(target), vx < 0)
    expect(rects.length).toBeGreaterThan(50)
    expect(farthest(rects, 300, 120)).toBeLessThanOrEqual(ufoHitRadius(target) + 1e-9)
  })

  it.each([TUNING.ufoSizeMin, TUNING.ufoSizeMax])('draws nothing, sparkles included, past the old saucer (size %i)', (size) => {
    for (const still of [false, true]) {
      const rects: Rect[] = []
      drawWitch(recordingContext(rects), ufo(size, 1), palette, still)
      expect(farthest(rects, 300, 120)).toBeLessThanOrEqual(size / 2)
    }
  })
})
