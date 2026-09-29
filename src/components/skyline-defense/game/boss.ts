import { addPopup } from './chains'
import { bossAppearance, bossStats, isBossWave, killFragments } from './bossStats'
import { blastMaxRadius, blastRadius, buildingContains, distance } from './geometry'
import { waveMultiplier } from './scoring'
import { TUNING } from './tuning'
import type { BlastKind, Boss, GameState, Meteor, Vec } from './types'
import { spawnSalvo, splitMeteor, waveConfig } from './waves'

// The boss wave: every TUNING.bossEvery-th wave a Mega-meteor replaces the
// normal spawns. It descends slowly toward a lit building; each shot whose
// blast (or chain blast) touches it takes one point of health, stalls and
// knocks it back, and sheds a fan of normal fragments. The last point
// breaks it apart for boss points; reaching the city knocks out every
// building within a wide radius. A light trickle of normal meteors falls
// while it's alive. Everything random here draws from state.bossRng.

type AddBlast = (kind: BlastKind, pos: Vec, chainId: number | null, radius?: number) => void

export function bossRadius(width: number, height: number): number {
  const radius = Math.min(height * TUNING.bossRadiusHeightFraction, width * TUNING.bossRadiusMaxWidthFraction)
  return Math.min(Math.max(radius, TUNING.bossRadiusMin), TUNING.bossRadiusMax)
}

export const bossHitRadius = (boss: Boss) => boss.radius * TUNING.bossHitScale

// Enters just above the sky in the middle of the screen, heading for a lit
// building (or the middle of the city if none are lit).
export function spawnBoss(state: GameState, wave: number): Boss {
  const rng = state.bossRng
  const appearance = bossAppearance(wave)
  const stats = bossStats(appearance)
  const radius = bossRadius(state.width, state.height)
  const alive = state.buildings.filter((building) => building.alive)
  const pos = { x: state.width * (0.3 + rng() * 0.4), y: -radius }
  const targetX = alive.length > 0 ? alive[Math.floor(rng() * alive.length)].x : state.width / 2
  const speed = stats.speed * state.height
  const heading = Math.atan2(state.groundY - pos.y, targetX - pos.x)
  return {
    id: state.nextId++,
    pos,
    vel: { x: Math.cos(heading) * speed, y: Math.sin(heading) * speed },
    radius,
    health: stats.health,
    maxHealth: stats.health,
    appearance,
    fragments: stats.fragments,
    stall: 0,
    flash: 0,
    hitBy: [],
    age: 0,
  }
}

// Sets up a boss wave (called from beginWave): the boss, and the trickle's
// first spawn one interval into play.
export function beginBossWave(state: GameState, wave: number) {
  state.boss = isBossWave(wave) ? spawnBoss(state, wave) : null
  state.bossOutcome = null
  state.trickleSpawned = 0
  state.trickleTimer = TUNING.bossTrickleInterval
}

// A fan of normal fragments from the boss's underside, heading down at the
// wave's meteor speed, immune to the chain that shed them. The fan's total
// spread is kept under 120 degrees so none heads off nearly sideways.
function shed(state: GameState, boss: Boss, count: number, chainId: number): Meteor[] {
  const speed = waveConfig(state.wave, state.width).meteorSpeed * state.height
  const from = { x: boss.pos.x, y: boss.pos.y + boss.radius * 0.6 }
  const parent: Meteor = { id: 0, start: from, pos: from, vel: { x: 0, y: speed }, splitAtY: null }
  const fan = count > 1 ? Math.min(TUNING.bossFragmentFanDegrees, 120 / (count - 1)) : 0
  return splitMeteor(state, parent, count, fan).map((fragment) => ({ ...fragment, immuneChain: chainId }))
}

function destroy(state: GameState, boss: Boss, chainId: number, addBlast: AddBlast) {
  const points = TUNING.bossPoints * waveMultiplier(state.wave)
  state.score += points
  addPopup(state, boss.pos, `BOSS +${points}`, 'bonus')
  addBlast('chain', boss.pos, chainId, blastMaxRadius(state.width, state.height) * TUNING.bossExplosionScale)
  state.meteors.push(...shed(state, boss, killFragments(boss.fragments), chainId))
  state.boss = null
  state.bossOutcome = 'destroyed'
}

function impact(state: GameState, boss: Boss, addBlast: AddBlast) {
  const reach = TUNING.bossImpactRadiusFraction * state.width
  for (const building of state.buildings) if (Math.abs(building.x - boss.pos.x) <= reach) building.alive = false
  const at = { x: boss.pos.x, y: Math.min(boss.pos.y + boss.radius * 0.8, state.groundY) }
  addBlast('impact', at, null, blastMaxRadius(state.width, state.height) * TUNING.bossImpactFlashScale)
  state.shake = TUNING.bossShakeSeconds
  state.boss = null
  state.bossOutcome = 'impact'
}

// One hit from a shot's chain: a point of health, a flash, a stall and
// knockback, and a fan of fragments -- or, on the last point, the kill.
function hit(state: GameState, boss: Boss, chainId: number, addBlast: AddBlast) {
  boss.hitBy.push(chainId)
  boss.health -= 1
  if (boss.health <= 0) {
    destroy(state, boss, chainId, addBlast)
    return
  }
  boss.flash = TUNING.bossFlashSeconds
  boss.stall = TUNING.bossStallSeconds
  boss.pos.y -= TUNING.bossKnockback * state.height
  state.meteors.push(...shed(state, boss, boss.fragments, chainId))
}

// The trickle of single meteors while the boss is alive.
function stepTrickle(state: GameState, dt: number) {
  if (!state.boss || state.trickleSpawned >= TUNING.bossTrickleMax) return
  state.trickleTimer -= dt
  if (state.trickleTimer > 0) return
  state.meteors.push(...spawnSalvo(state, waveConfig(state.wave, state.width), 1, state.bossRng))
  state.trickleSpawned += 1
  state.trickleTimer = TUNING.bossTrickleInterval
}

// Moves the boss, resolves hits from interceptor and chain blasts (each
// shot's chain hits at most once), and checks for it reaching the city.
export function stepBoss(state: GameState, dt: number, addBlast: AddBlast) {
  state.shake = Math.max(0, state.shake - dt)
  stepTrickle(state, dt)
  const boss = state.boss
  if (!boss) return
  boss.age += dt
  boss.flash = Math.max(0, boss.flash - dt)
  if (boss.stall > 0) {
    boss.stall = Math.max(0, boss.stall - dt)
  } else {
    boss.pos.x += boss.vel.x * dt
    boss.pos.y += boss.vel.y * dt
  }

  for (const blast of state.blasts) {
    if (blast.kind !== 'interceptor' && blast.kind !== 'chain') continue
    if (blast.chainId === null || boss.hitBy.includes(blast.chainId)) continue
    const radius = blastRadius(blast)
    if (radius <= 0 || distance(blast.pos, boss.pos) > radius + bossHitRadius(boss)) continue
    hit(state, boss, blast.chainId, addBlast)
    if (!state.boss) return
  }

  const bottom = { x: boss.pos.x, y: boss.pos.y + boss.radius * 0.8 }
  const reached =
    bottom.y >= state.groundY ||
    state.buildings.some((building) => building.alive && buildingContains(building, state.groundY, bottom))
  if (reached) impact(state, boss, addBlast)
}
