import { TUNING } from './tuning'
import type { Blast, Building, Launcher, Vec } from './types'

export type Rect = { left: number; right: number; top: number; bottom: number }

export function distance(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function circleContains(center: Vec, radius: number, point: Vec): boolean {
  return distance(center, point) <= radius
}

export function rectContains(rect: Rect, point: Vec): boolean {
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
}

export function polygonContains(polygon: Vec[], point: Vec): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]
    const b = polygon[j]
    if (a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

// Whether a point is inside the building as drawn (its outline).
export function buildingContains(building: Building, groundY: number, point: Vec): boolean {
  return (
    rectContains(buildingRect(building, groundY), point) &&
    building.outline.some((polygon) => polygonContains(polygon, point))
  )
}

// A building's bounding box: its full width and height above the ground.
export function buildingRect(building: Building, groundY: number): Rect {
  return {
    left: building.x - building.width / 2,
    right: building.x + building.width / 2,
    top: groundY - building.height,
    bottom: groundY,
  }
}

// Full blast radius (a radius, not a diameter) for a world this size: a
// share of its height, capped by its width, clamped to px.
export function blastMaxRadius(width: number, height: number): number {
  const radius = Math.min(height * TUNING.blastRadiusHeightFraction, width * TUNING.blastRadiusMaxWidthFraction)
  return Math.min(Math.max(radius, TUNING.blastRadiusMin), TUNING.blastRadiusMax)
}

export const blastLifetime = TUNING.blastGrow + TUNING.blastHold + TUNING.blastShrink

// Current radius: grows to maxRadius, holds, then shrinks back to zero.
export function blastRadius(blast: Blast): number {
  const { age, maxRadius } = blast
  if (age <= 0) return 0
  if (age < TUNING.blastGrow) return (maxRadius * age) / TUNING.blastGrow
  if (age < TUNING.blastGrow + TUNING.blastHold) return maxRadius
  if (age < blastLifetime) return maxRadius * (1 - (age - TUNING.blastGrow - TUNING.blastHold) / TUNING.blastShrink)
  return 0
}

export type BlastStage = 'grow' | 'hold' | 'shrink' | 'done'

export function blastStage(blast: Blast): BlastStage {
  if (blast.age < TUNING.blastGrow) return 'grow'
  if (blast.age < TUNING.blastGrow + TUNING.blastHold) return 'hold'
  if (blast.age < blastLifetime) return 'shrink'
  return 'done'
}

// The launcher with ammo closest to x (horizontally), or null if all are
// empty. Ties go to the leftmost.
export function nearestLauncherWithAmmo(launchers: Launcher[], x: number): Launcher | null {
  let best: Launcher | null = null
  for (const launcher of launchers) {
    if (launcher.ammo <= 0) continue
    if (!best || Math.abs(launcher.x - x) < Math.abs(best.x - x)) best = launcher
  }
  return best
}
