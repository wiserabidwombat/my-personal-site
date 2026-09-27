import { groundLevel, layoutBuildings, layoutLaunchers } from './skyline'
import type { GameState, Vec } from './types'

// Fits a running game to a new canvas size: the skyline and launchers are
// laid out again for the new size (keeping which buildings are dark and
// each launcher's ammo), and everything in flight scales with the world.
export function resizeWorld(state: GameState, width: number, height: number) {
  if (width === state.width && height === state.height) return
  const scaleX = width / state.width
  const scaleY = height / state.height
  const scale = (point: Vec) => {
    point.x *= scaleX
    point.y *= scaleY
  }

  // Match buildings by kind, in order (the generic ones only exist on
  // wide screens). A building that appears mid-game (narrow to wide)
  // starts dark so a resize can't hand out free buildings.
  const oldByKind = new Map<string, boolean[]>()
  for (const building of state.buildings) {
    oldByKind.set(building.kind, [...(oldByKind.get(building.kind) ?? []), building.alive])
  }
  const seen = new Map<string, number>()
  state.buildings = layoutBuildings(width, height).map((building) => {
    const index = seen.get(building.kind) ?? 0
    seen.set(building.kind, index + 1)
    const previous = oldByKind.get(building.kind)?.[index]
    return { ...building, alive: previous ?? state.phase === 'ready' }
  })

  const ammo = state.launchers.map((launcher) => launcher.ammo)
  state.launchers = layoutLaunchers(width, height, 0).map((launcher, index) => ({ ...launcher, ammo: ammo[index] ?? 0 }))

  for (const meteor of state.meteors) {
    scale(meteor.start)
    scale(meteor.pos)
    meteor.vel.x *= scaleX
    meteor.vel.y *= scaleY
    if (meteor.splitAtY !== null) meteor.splitAtY *= scaleY
  }
  for (const shot of state.interceptors) {
    scale(shot.from)
    scale(shot.pos)
    scale(shot.target)
  }
  for (const blast of state.blasts) scale(blast.pos)

  state.width = width
  state.height = height
  state.groundY = groundLevel(height)
}
