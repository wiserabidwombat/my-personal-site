import {
  blastLifetime,
  blastMaxRadius,
  blastRadius,
  buildingContains,
  circleContains,
  distance,
  nearestLauncherWithAmmo,
} from './geometry'
import { planBonus, stepBonus } from './bonus'
import { beginBossWave, stepBoss } from './boss'
import { isBossWave } from './bossStats'
import { scoreKill } from './chains'
import { waveBonus } from './scoring'
import { groundLevel, LAUNCHER_SIZE, layoutBuildings, layoutLaunchers, skylineScale } from './skyline'
import { TUNING } from './tuning'
import type { BlastKind, GameState, Vec } from './types'
import { salvoSize, spawnSalvo, splitMeteor, waveConfig } from './waves'

export { blastMaxRadius }

// `bonusRng` drives the bonus targets separately from the meteors (see
// GameState.bonusRng), and `bossRng` the boss waves; they default to the
// same stream.
export function createGame(
  width: number,
  height: number,
  rng: () => number = Math.random,
  bonusRng: () => number = rng,
  bossRng: () => number = bonusRng,
): GameState {
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
    ufos: [],
    scouts: [],
    popups: [],
    bonusPlan: { ufoTimes: [], scoutTime: null, elapsed: 0 },
    chains: {},
    waveLongestChain: 0,
    hudBottom: 0,
    reducedMotion: false,
    nextId: 1,
    rng,
    bonusRng,
    bossRng,
    boss: null,
    bossOutcome: null,
    trickleSpawned: 0,
    trickleTimer: 0,
    shake: 0,
  }
}

function setPhase(state: GameState, phase: GameState['phase']) {
  state.phase = phase
  state.phaseTime = 0
}

// A boss wave (see boss.ts) replaces the normal spawns with the boss and
// its trickle.
export function beginWave(state: GameState, wave: number) {
  const config = waveConfig(wave, state.width)
  state.wave = wave
  state.toSpawn = isBossWave(wave) ? 0 : config.meteorCount
  state.spawnTimer = 0.6
  state.meteors = []
  state.interceptors = []
  state.ufos = []
  state.scouts = []
  state.chains = {}
  state.waveLongestChain = 0
  state.bonusPlan = planBonus(state, wave)
  beginBossWave(state, wave)
  for (const launcher of state.launchers) launcher.ammo = config.ammoPerLauncher
  setPhase(state, 'waveTitle')
}

// Fresh city, score 0, wave 1.
export function startGame(state: GameState) {
  state.score = 0
  state.lastBonus = null
  state.blasts = []
  state.popups = []
  state.shake = 0
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

export function chainBlastRadius(width: number, height: number): number {
  return blastMaxRadius(width, height) * TUNING.chainRadiusFraction
}

// `chainId` ties the blast to the shot it descends from (null for impacts);
// `radius` overrides the kind's usual full size.
function addBlast(state: GameState, kind: BlastKind, pos: Vec, chainId: number | null, radius?: number) {
  const maxRadius =
    radius ??
    (kind === 'impact'
      ? TUNING.impactRadius
      : kind === 'chain'
        ? chainBlastRadius(state.width, state.height)
        : blastMaxRadius(state.width, state.height))
  state.blasts.push({ id: state.nextId++, kind, pos: { ...pos }, maxRadius, age: 0, chainId })
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
      // Each shot starts its own chain.
      addBlast(state, 'interceptor', shot.target, shot.id)
      return false
    }
    shot.pos.x += ((shot.target.x - shot.pos.x) / remaining) * speed * dt
    shot.pos.y += ((shot.target.y - shot.pos.y) / remaining) * speed * dt
    return true
  })
}

// Meteors touching a live (non-impact) blast are destroyed, score with the
// chain bonus, and leave a chain blast of their own in the same chain;
// meteors reaching a lit building or the ground knock it out and flash. A
// boss fragment ignores the chain that shed it.
function resolveCollisions(state: GameState) {
  const destructive = state.blasts.filter((blast) => blast.kind !== 'impact' && blastRadius(blast) > 0)
  state.meteors = state.meteors.filter((meteor) => {
    const blast = destructive.find(
      (b) => b.chainId !== meteor.immuneChain && circleContains(b.pos, blastRadius(b), meteor.pos),
    )
    if (blast) {
      scoreKill(state, meteor.pos, TUNING.meteorPoints, blast.chainId)
      addBlast(state, 'chain', meteor.pos, blast.chainId)
      return false
    }
    const hit = state.buildings.find(
      (building) => building.alive && buildingContains(building, state.groundY, meteor.pos),
    )
    if (hit || meteor.pos.y >= state.groundY) {
      if (hit) hit.alive = false
      addBlast(state, 'impact', { x: meteor.pos.x, y: Math.min(meteor.pos.y, state.groundY) }, null)
      return false
    }
    return true
  })
}

function waveCleared(state: GameState): boolean {
  return (
    state.toSpawn === 0 &&
    state.boss === null &&
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
  for (const popup of state.popups) popup.age += dt
  state.popups = state.popups.filter((popup) => popup.age < TUNING.popupSeconds)

  if (state.phase === 'waveTitle' && state.phaseTime >= TUNING.waveTitleTime) setPhase(state, 'playing')
  if (state.phase === 'waveBonus' && state.phaseTime >= TUNING.waveBonusTime) beginWave(state, state.wave + 1)
  if (state.phase !== 'playing') return

  const config = waveConfig(state.wave, state.width)
  state.spawnTimer -= dt
  if (state.toSpawn > 0 && state.spawnTimer <= 0) {
    const salvo = spawnSalvo(state, config, salvoSize(state, config, state.toSpawn))
    state.meteors.push(...salvo)
    state.toSpawn -= salvo.length
    // A salvo uses up its members' share of the wave's time, so the
    // average rate of meteors per second doesn't change.
    state.spawnTimer = config.spawnInterval * salvo.length
  }

  moveProjectiles(state, dt)
  resolveCollisions(state)
  stepBonus(state, dt, (kind, pos, chainId, radius) => addBlast(state, kind, pos, chainId, radius))
  stepBoss(state, dt, (kind, pos, chainId, radius) => addBlast(state, kind, pos, chainId, radius))

  if (!state.buildings.some((building) => building.alive)) {
    setPhase(state, 'gameOver')
  } else if (waveCleared(state)) {
    // Bonus targets still crossing just leave; they never hold up a wave.
    state.ufos = []
    state.scouts = []
    const alive = state.buildings.filter((b) => b.alive).length
    state.lastBonus = waveBonus(alive, totalAmmo(state), state.wave, state.bossOutcome === 'destroyed')
    state.score += state.lastBonus.total
    setPhase(state, 'waveBonus')
  }
}
