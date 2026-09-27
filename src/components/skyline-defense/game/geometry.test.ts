import { describe, expect, it } from 'vitest'
import { blastLifetime, blastRadius, buildingRect, circleContains, nearestLauncherWithAmmo, rectContains } from './geometry'
import { TUNING } from './tuning'
import type { Blast, Building } from './types'

const blast = (age: number): Blast => ({ id: 1, kind: 'interceptor', pos: { x: 0, y: 0 }, maxRadius: 40, age })

describe('collision helpers', () => {
  it('circleContains includes the edge and excludes points outside', () => {
    expect(circleContains({ x: 0, y: 0 }, 10, { x: 6, y: 8 })).toBe(true)
    expect(circleContains({ x: 0, y: 0 }, 10, { x: 6, y: 8.1 })).toBe(false)
  })

  it('rectContains uses inclusive edges', () => {
    const rect = { left: 0, right: 10, top: 0, bottom: 10 }
    expect(rectContains(rect, { x: 10, y: 0 })).toBe(true)
    expect(rectContains(rect, { x: 10.5, y: 5 })).toBe(false)
  })

  it('buildingRect spans the base width and rises from the ground', () => {
    const building: Building = { id: 0, kind: 'bofa', x: 100, width: 40, height: 200, alive: true }
    expect(buildingRect(building, 500)).toEqual({ left: 80, right: 120, top: 300, bottom: 500 })
  })
})

describe('blastRadius', () => {
  it('grows, holds at the maximum, shrinks, then ends', () => {
    expect(blastRadius(blast(0))).toBe(0)
    expect(blastRadius(blast(TUNING.blastGrow / 2))).toBeCloseTo(20)
    expect(blastRadius(blast(TUNING.blastGrow + TUNING.blastHold / 2))).toBe(40)
    expect(blastRadius(blast(blastLifetime - TUNING.blastShrink / 2))).toBeCloseTo(20)
    expect(blastRadius(blast(blastLifetime))).toBe(0)
  })
})

describe('nearestLauncherWithAmmo', () => {
  const launchers = () => [
    { x: 0, y: 0, ammo: 3 },
    { x: 50, y: 0, ammo: 3 },
    { x: 100, y: 0, ammo: 3 },
  ]

  it('picks the closest launcher horizontally', () => {
    expect(nearestLauncherWithAmmo(launchers(), 90)?.x).toBe(100)
  })

  it('skips empty launchers, and returns null when all are empty', () => {
    const list = launchers()
    list[2].ammo = 0
    expect(nearestLauncherWithAmmo(list, 90)?.x).toBe(50)
    for (const launcher of list) launcher.ammo = 0
    expect(nearestLauncherWithAmmo(list, 90)).toBeNull()
  })
})
