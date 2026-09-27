import type { Building, BuildingKind, Launcher } from './types'

// Below this world width the skyline drops its generic buildings so the
// landmarks keep a readable size, rather than shrinking everything.
export const NARROW_WIDTH = 560

// The skyline (its tallest building) never rises above this share of the
// canvas height; extra height on tall screens becomes sky.
export const SKYLINE_HEIGHT_FRACTION = 0.25

// Each landmark's width and height in design units: stylized, but in
// proportion to the real towers. Buildings and launchers are all drawn at
// one uniform scale (skylineScale), so x and y never stretch independently.
type Spec = { kind: BuildingKind; width: number; height: number }

const reunion: Spec = { kind: 'reunion', width: 40, height: 175 }
const bofa: Spec = { kind: 'bofa', width: 56, height: 262 }
const fountain: Spec = { kind: 'fountain', width: 70, height: 212 }
const comerica: Spec = { kind: 'comerica', width: 62, height: 232 }
const renaissance: Spec = { kind: 'renaissance', width: 62, height: 250 }
const genericLow: Spec = { kind: 'generic', width: 72, height: 110 }
const genericMid: Spec = { kind: 'generic', width: 62, height: 148 }
const TALLEST = bofa.height

export const LAUNCHER_SIZE = { width: 40, height: 13 }

// Buildings sit in two groups between the three launchers, each spread
// across its span of the width (as fractions).
type Layout = { groups: Spec[][]; spans: [number, number][] }
const layouts: Record<'wide' | 'narrow', Layout> = {
  wide: {
    groups: [
      [reunion, genericLow, bofa, fountain],
      [comerica, genericMid, renaissance],
    ],
    spans: [
      [0.14, 0.44],
      [0.56, 0.86],
    ],
  },
  narrow: {
    groups: [
      [reunion, bofa, fountain],
      [comerica, renaissance],
    ],
    spans: [
      [0.12, 0.45],
      [0.55, 0.88],
    ],
  },
}
// Room around each building within its group, as a multiple of its width.
// Whatever the group doesn't fill is shared out as equal gaps.
const SPACING = 1.35
export const launcherFractions = [0.07, 0.5, 0.93] as const

const layoutFor = (width: number) => (width < NARROW_WIDTH ? layouts.narrow : layouts.wide)

export function groundLevel(height: number): number {
  return Math.round(height * 0.86)
}

// World pixels per design unit: the largest scale at which every group fits
// its span, capped so the skyline stays within SKYLINE_HEIGHT_FRACTION of
// the height.
export function skylineScale(width: number, height: number): number {
  const { groups, spans } = layoutFor(width)
  const fit = Math.min(
    ...groups.map((group, index) => {
      const [start, end] = spans[index]
      const needed = group.reduce((sum, spec) => sum + spec.width, 0) * SPACING
      return ((end - start) * width) / needed
    }),
  )
  return Math.min(fit, (height * SKYLINE_HEIGHT_FRACTION) / TALLEST)
}

export function layoutBuildings(width: number, height: number): Building[] {
  const { groups, spans } = layoutFor(width)
  const scale = skylineScale(width, height)
  const buildings: Building[] = []
  groups.forEach((group, groupIndex) => {
    const [start, end] = spans[groupIndex]
    const widths = group.map((spec) => spec.width * scale)
    const gap = ((end - start) * width - widths.reduce((sum, w) => sum + w, 0)) / (group.length + 1)
    let left = start * width + gap
    group.forEach((spec, index) => {
      buildings.push({
        id: buildings.length,
        kind: spec.kind,
        x: left + widths[index] / 2,
        width: widths[index],
        height: spec.height * scale,
        alive: true,
      })
      left += widths[index] + gap
    })
  })
  return buildings
}

export function layoutLaunchers(width: number, height: number, ammo: number): Launcher[] {
  const groundY = groundLevel(height)
  return launcherFractions.map((fraction) => ({ x: fraction * width, y: groundY, ammo }))
}
