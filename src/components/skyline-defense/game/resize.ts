import { bossRadius } from './boss'
import { groundLevel, layoutBuildings, layoutLaunchers, skylineScale } from './skyline'
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

  // Match buildings by name (some are only in view on wide screens). A
  // building that comes into view mid-game (narrow to wide) starts dark so
  // a resize can't hand out free buildings.
  const wasAlive = new Map(state.buildings.map((building) => [building.name, building.alive]))
  state.buildings = layoutBuildings(width, height).map((building) => ({
    ...building,
    alive: wasAlive.get(building.name) ?? state.phase === 'ready',
  }))

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
  for (const ufo of state.ufos) {
    scale(ufo.pos)
    ufo.vx *= scaleX
  }
  for (const scout of state.scouts) {
    scale(scout.pos)
    scout.baseY *= scaleY
    scout.vx *= scaleX
  }
  for (const popup of state.popups) scale(popup.pos)
  if (state.boss) {
    scale(state.boss.pos)
    state.boss.vel.x *= scaleX
    state.boss.vel.y *= scaleY
    state.boss.radius = bossRadius(width, height)
  }

  state.width = width
  state.height = height
  state.groundY = groundLevel(height)
  state.scale = skylineScale(width, height)
}
