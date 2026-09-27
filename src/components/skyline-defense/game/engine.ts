import { blastLifetime, blastRadius, buildingRect, circleContains, distance, nearestLauncherWithAmmo, rectContains } from './geometry'
import { meteorPoints, waveBonus } from './scoring'
import { groundLevel, LAUNCHER_SIZE, layoutBuildings, layoutLaunchers, skylineScale } from './skyline'
import { TUNING } from './tuning'
import type { BlastKind, GameState, Vec } from './types'
import { spawnMeteor, splitMeteor, waveConfig } from './waves'

export function createGame(width: number, height: number, rng: () => number = Math.random): GameState {
  return {
    width,
    height,
    groundY: groundLevel(height),
    scale: skylineScale(width, height),
    phase: 'ready',
    phaseTime: 0,
    wave: 0,
    score: 0,
    buildings: layoutBuildings(width, height),
    launchers: layoutLaunchers(width, height, 0),
    meteors: [],
    interceptors: [],
    blasts: [],
    toSpawn: 0,
    spawnTimer: 0,
    lastBonus: null,
    nextId: 1,
    rng,
  }
}

function setPhase(state: GameState, phase: GameState['phase']) {
  state.phase = phase
  state.phaseTime = 0
}

export function beginWave(state: GameState, wave: number) {
  const config = waveConfig(wave)
  state.wave = wave
  state.toSpawn = config.meteorCount
  state.spawnTimer = 0.6
  state.meteors = []
  state.interceptors = []
  for (const launcher of state.launchers) launcher.ammo = config.ammoPerLauncher
  setPhase(state, 'waveTitle')
}

// Fresh city, score 0, wave 1.
export function startGame(state: GameState) {
  state.score = 0
  state.lastBonus = null
  state.blasts = []
  state.buildings = layoutBuildings(state.width, state.height)
  beginWave(state, 1)
}

export function totalAmmo(state: GameState): number {
  return state.launchers.reduce((sum, launcher) => sum + launcher.ammo, 0)
}

// Fires from the nearest launcher with ammo toward target (kept above the
// ground). Returns false if nothing was fired.
export function fire(state: GameState, target: Vec): boolean {
  if (state.phase !== 'playing') return false
  const launcher = nearestLauncherWithAmmo(state.launchers, target.x)
  if (!launcher) return false
  launcher.ammo -= 1
  const from = { x: launcher.x, y: launcher.y - LAUNCHER_SIZE.height * state.scale }
  const aim = { x: target.x, y: Math.min(target.y, state.groundY - 12) }
  state.interceptors.push({ id: state.nextId++, from, pos: { ...from }, target: aim })
  return true
}

export function blastMaxRadius(width: number): number {
  return Math.min(Math.max(width * TUNING.blastRadiusFraction, TUNING.blastRadiusMin), TUNING.blastRadiusMax)
}

export function chainBlastRadius(width: number): number {
  return blastMaxRadius(width) * TUNING.chainRadiusFraction
}

function addBlast(state: GameState, kind: BlastKind, pos: Vec) {
  const maxRadius =
    kind === 'impact' ? TUNING.impactRadius : kind === 'chain' ? chainBlastRadius(state.width) : blastMaxRadius(state.width)
  state.blasts.push({ id: state.nextId++, kind, pos: { ...pos }, maxRadius, age: 0 })
}

function moveProjectiles(state: GameState, dt: number) {
  const next = []
  for (const meteor of state.meteors) {
    meteor.pos.x += meteor.vel.x * dt
    meteor.pos.y += meteor.vel.y * dt
    if (meteor.splitAtY !== null && meteor.pos.y >= meteor.splitAtY) next.push(...splitMeteor(state, meteor))
    else next.push(meteor)
  }
  state.meteors = next

  const speed = TUNING.interceptorSpeed * state.height
  state.interceptors = state.interceptors.filter((shot) => {
    const remaining = distance(shot.pos, shot.target)
    if (remaining <= speed * dt) {
      addBlast(state, 'interceptor', shot.target)
      return false
    }
    shot.pos.x += ((shot.target.x - shot.pos.x) / remaining) * speed * dt
    shot.pos.y += ((shot.target.y - shot.pos.y) / remaining) * speed * dt
    return true
  })
}

// Meteors touching a live interceptor or chain blast are destroyed, score,
// and leave a chain blast of their own; meteors reaching a lit building or
// the ground knock it out and flash.
function resolveCollisions(state: GameState) {
  const destructive = state.blasts.filter((blast) => blast.kind !== 'impact' && blastRadius(blast) > 0)
  state.meteors = state.meteors.filter((meteor) => {
    if (destructive.some((blast) => circleContains(blast.pos, blastRadius(blast), meteor.pos))) {
      state.score += meteorPoints(state.wave)
      addBlast(state, 'chain', meteor.pos)
      return false
    }
    const hit = state.buildings.find(
      (building) => building.alive && rectContains(buildingRect(building, state.groundY), meteor.pos),
    )
    if (hit || meteor.pos.y >= state.groundY) {
      if (hit) hit.alive = false
      addBlast(state, 'impact', { x: meteor.pos.x, y: Math.min(meteor.pos.y, state.groundY) })
      return false
    }
    return true
  })
}

function waveCleared(state: GameState): boolean {
  return (
    state.toSpawn === 0 &&
    state.meteors.length === 0 &&
    state.interceptors.length === 0 &&
    !state.blasts.some((blast) => blast.kind !== 'impact')
  )
}

// Advances the game by dt seconds.
export function step(state: GameState, dt: number) {
  state.phaseTime += dt
  for (const blast of state.blasts) blast.age += dt
  state.blasts = state.blasts.filter((blast) => blast.age < blastLifetime)

  if (state.phase === 'waveTitle' && state.phaseTime >= TUNING.waveTitleTime) setPhase(state, 'playing')
  if (state.phase === 'waveBonus' && state.phaseTime >= TUNING.waveBonusTime) beginWave(state, state.wave + 1)
  if (state.phase !== 'playing') return

  const config = waveConfig(state.wave)
  state.spawnTimer -= dt
  if (state.toSpawn > 0 && state.spawnTimer <= 0) {
    state.meteors.push(spawnMeteor(state, config))
    state.toSpawn -= 1
    state.spawnTimer = config.spawnInterval
  }

  moveProjectiles(state, dt)
  resolveCollisions(state)

  if (!state.buildings.some((building) => building.alive)) {
    setPhase(state, 'gameOver')
  } else if (waveCleared(state)) {
    state.lastBonus = waveBonus(state.buildings.filter((b) => b.alive).length, totalAmmo(state), state.wave)
    state.score += state.lastBonus.total
    setPhase(state, 'waveBonus')
  }
}
