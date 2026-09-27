import type { Building, BuildingKind, Launcher } from './types'

// Below this world width the skyline drops its generic buildings so the
// landmarks keep a readable size, rather than shrinking everything.
export const NARROW_WIDTH = 560

type Spec = { kind: BuildingKind; heightScale: number; widthScale: number }

const reunion: Spec = { kind: 'reunion', heightScale: 0.62, widthScale: 0.6 }
const bofa: Spec = { kind: 'bofa', heightScale: 1, widthScale: 0.75 }
const fountain: Spec = { kind: 'fountain', heightScale: 0.8, widthScale: 0.9 }
const comerica: Spec = { kind: 'comerica', heightScale: 0.88, widthScale: 0.85 }
const renaissance: Spec = { kind: 'renaissance', heightScale: 0.84, widthScale: 0.85 }
const genericLow: Spec = { kind: 'generic', heightScale: 0.42, widthScale: 0.95 }
const genericMid: Spec = { kind: 'generic', heightScale: 0.55, widthScale: 0.9 }

// Buildings sit in two groups between the three launchers.
const groups = {
  wide: [
    [reunion, genericLow, bofa, fountain],
    [comerica, genericMid, renaissance],
  ],
  narrow: [
    [reunion, bofa, fountain],
    [comerica, renaissance],
  ],
}
const groupSpans = [
  [0.14, 0.44],
  [0.56, 0.86],
] as const
export const launcherFractions = [0.07, 0.5, 0.93] as const

export function groundLevel(height: number): number {
  return Math.round(height * 0.86)
}

export function layoutBuildings(width: number, height: number): Building[] {
  const groundY = groundLevel(height)
  const maxHeight = Math.min(groundY * 0.42, 260)
  const layout = width < NARROW_WIDTH ? groups.narrow : groups.wide
  const buildings: Building[] = []
  layout.forEach((group, groupIndex) => {
    const [start, end] = groupSpans[groupIndex]
    const slot = ((end - start) * width) / group.length
    group.forEach((spec, index) => {
      buildings.push({
        id: buildings.length,
        kind: spec.kind,
        x: start * width + slot * (index + 0.5),
        width: Math.min(slot * 0.8 * spec.widthScale, 90),
        height: maxHeight * spec.heightScale,
        alive: true,
      })
    })
  })
  return buildings
}

export function layoutLaunchers(width: number, height: number, ammo: number): Launcher[] {
  const groundY = groundLevel(height)
  return launcherFractions.map((fraction) => ({ x: fraction * width, y: groundY, ammo }))
}
