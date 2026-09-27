import { describe, expect, it } from 'vitest'
import { buildingContains, polygonContains } from './geometry'
import { CITY_BAND, cityView, groundLevel, layoutBuildings, REGIONS, shapeOutline, toWorld } from './skyline'

const names = (width: number, height: number) => layoutBuildings(width, height).map((b) => b.name)

describe('city layout', () => {
  it('defends every outlined building except the phone-only ones on wide screens', () => {
    const wide = REGIONS.filter((r) => !r.narrowOnly).map((r) => r.name)
    expect(wide).toHaveLength(8)
    expect(names(1280, 741)).toEqual(wide)
    expect(names(768, 965)).toEqual(wide)
  })

  it('gives phones five or more fully visible targets, keeping Reunion Tower and Bank of America Plaza', () => {
    const tall = [
      'Reunion Tower',
      'Gold-domed building',
      'Fountain Place',
      'Bank of America Plaza',
      'Tower east of Bank of America',
    ]
    // Tall phones zoom in; the cut-off Renaissance Tower is scenery.
    for (const [width, height] of [
      [390, 791],
      [360, 700],
    ]) {
      expect(names(width, height)).toEqual(tall)
    }
    // Shorter narrow windows see a wider crop, with Renaissance Tower too.
    expect(names(390, 600)).toEqual([...tall.slice(0, 5), 'Renaissance Tower'])
    expect(cityView(390, 791).scale / cityView(390, 600).scale).toBeCloseTo(610 / 517)
  })

  it('scales the image to the width and stands its bottom on the ground', () => {
    const view = cityView(1280, 741)
    expect(view.scale).toBeCloseTo(1280 / 2172)
    expect(toWorld(view, 0, CITY_BAND.bottom)).toEqual({ x: 0, y: groundLevel(741) })
    expect(toWorld(view, 2172, CITY_BAND.bottom).x).toBeCloseTo(1280)
  })

  it('keeps every outline on screen and above the ground', () => {
    for (const [width, height] of [
      [1280, 741],
      [390, 791],
      [360, 700],
    ]) {
      for (const building of layoutBuildings(width, height)) {
        for (const point of building.outline.flat()) {
          expect(point.x).toBeGreaterThanOrEqual(0)
          expect(point.x).toBeLessThanOrEqual(width)
          expect(point.y).toBeLessThanOrEqual(groundLevel(height))
        }
      }
    }
  })

  it('never overlaps two outlines, so a destroyed building dims only itself', () => {
    const polygons = REGIONS.map((r) => r.shapes.map((shape) => shapeOutline(shape).map(([x, y]) => ({ x, y }))))
    const inside = (index: number, point: { x: number; y: number }) =>
      polygons[index].some((polygon) => polygonContains(polygon, point))
    for (let a = 0; a < REGIONS.length; a++) {
      const points = polygons[a].flat()
      const [x0, x1] = [Math.min(...points.map((p) => p.x)), Math.max(...points.map((p) => p.x))]
      const [y0, y1] = [Math.min(...points.map((p) => p.y)), Math.max(...points.map((p) => p.y))]
      for (let x = x0 + 0.5; x < x1; x += 2) {
        for (let y = y0 + 0.5; y < y1; y += 2) {
          if (!inside(a, { x, y })) continue
          for (let b = a + 1; b < REGIONS.length; b++) {
            expect(inside(b, { x, y }), `${REGIONS[a].name} overlaps ${REGIONS[b].name} at ${x},${y}`).toBe(false)
          }
        }
      }
    }
  })

  it('hits what is drawn: inside the outline, not the gaps around it', () => {
    const [reunion] = layoutBuildings(1280, 741)
    const view = cityView(1280, 741)
    const groundY = groundLevel(741)
    expect(buildingContains(reunion, groundY, toWorld(view, 445, 220))).toBe(true)
    // Between two of the tower's legs.
    expect(buildingContains(reunion, groundY, toWorld(view, 436, 380))).toBe(false)
  })
})
