import { describe, expect, it } from 'vitest'
import { groundLevel, layoutBuildings, SKYLINE_HEIGHT_FRACTION, skylineScale } from './skyline'

const sizes: [number, number][] = [
  [1280, 741],
  [768, 900],
  [430, 830],
  [390, 791],
  [360, 700],
]

describe('skyline layout', () => {
  it('keeps every landmark in the same proportions at every size', () => {
    const ratios = sizes.map(([width, height]) =>
      Object.fromEntries(layoutBuildings(width, height).map((b) => [b.kind, b.height / b.width])),
    )
    for (const kind of ['reunion', 'bofa', 'fountain', 'comerica', 'renaissance']) {
      const values = ratios.map((r) => r[kind])
      for (const value of values) expect(value).toBeCloseTo(values[0], 6)
    }
  })

  it('caps the skyline at its share of the height, leaving extra height as sky', () => {
    for (const [width, height] of sizes) {
      const tallest = Math.max(...layoutBuildings(width, height).map((b) => b.height))
      expect(tallest).toBeLessThanOrEqual(height * SKYLINE_HEIGHT_FRACTION + 1e-6)
    }
    // A much taller portrait canvas doesn't make the buildings any taller.
    expect(skylineScale(390, 1600)).toBe(skylineScale(390, 1000))
  })

  it('keeps buildings inside the canvas and clear of each other', () => {
    for (const [width, height] of sizes) {
      const buildings = layoutBuildings(width, height).sort((a, b) => a.x - b.x)
      buildings.forEach((b, i) => {
        expect(b.x - b.width / 2).toBeGreaterThanOrEqual(0)
        expect(b.x + b.width / 2).toBeLessThanOrEqual(width)
        // A clear gap to the next building, so neighbors never read as one.
        const next = buildings[i + 1]
        if (next) expect(next.x - next.width / 2 - (b.x + b.width / 2)).toBeGreaterThanOrEqual(6)
      })
      expect(groundLevel(height)).toBeLessThan(height)
    }
  })
})
