import { scoreKill } from './chains'
import { blastMaxRadius, blastRadius, distance } from './geometry'
import { CITY_BAND, cityView } from './skyline'
import { TUNING } from './tuning'
import type { Blast, BonusPlan, GameState, Scout, Ufo } from './types'

// Harmless bonus targets: a flying saucer (UFO) and small alien scouts that
// cross the sky above the city. They never attack; the only cost of
// chasing them is ammo. Destroying one scores (with the chain bonus) and
// leaves a blast that can chain into meteors.

const between = (rng: () => number, min: number, max: number) => min + rng() * (max - min)

// Where bonus targets may fly: below the HUD (state.hudBottom, set by the
// page) and above the top of the skyline image.
export function bonusBand(state: GameState): { top: number; bottom: number } {
  const view = cityView(state.width, state.height)
  const cityTop = view.groundY - (CITY_BAND.bottom - CITY_BAND.top) * view.scale
  const top = state.hudBottom + 8
  return { top, bottom: Math.max(top + 1, cityTop - 8) }
}

export function planBonus(state: GameState, wave: number): BonusPlan {
  const rng = state.bonusRng
  const ufoTimes: number[] = []
  if (wave >= TUNING.ufoStartWave) {
    const first = between(rng, TUNING.ufoDelayMin, TUNING.ufoDelayMax)
    ufoTimes.push(first)
    if (wave >= TUNING.ufoSecondPassWave && rng() < TUNING.ufoSecondPassChance) {
      ufoTimes.push(first + between(rng, TUNING.ufoSecondPassGapMin, TUNING.ufoSecondPassGapMax))
    }
  }
  const scouts = wave >= TUNING.scoutStartWave && rng() < TUNING.scoutGroupChance
  return { ufoTimes, scoutTime: scouts ? between(rng, TUNING.scoutDelayMin, TUNING.scoutDelayMax) : null, elapsed: 0 }
}

export function ufoSize(width: number): number {
  return Math.min(Math.max(width * TUNING.ufoSizeFraction, TUNING.ufoSizeMin), TUNING.ufoSizeMax)
}

// A saucer entering from the left or right, somewhere in the sky band.
export function spawnUfo(state: GameState): Ufo {
  const size = ufoSize(state.width)
  const band = bonusBand(state)
  const fromLeft = state.bonusRng() < 0.5
  const y = Math.min(Math.max(between(state.bonusRng, band.top + size * 0.35, band.bottom - size * 0.35), band.top), band.bottom)
  const speed = (state.width + size * 2) / TUNING.ufoCrossSeconds
  return { id: state.nextId++, pos: { x: fromLeft ? -size : state.width + size, y }, vx: fromLeft ? speed : -speed, size, age: 0 }
}

// A loose line of scouts, one behind another along their path, spaced so a
// scout's chain-size blast reaches the next.
export function spawnScouts(state: GameState): Scout[] {
  const band = bonusBand(state)
  const wobble = TUNING.scoutWobble * (band.bottom - band.top)
  const size = TUNING.scoutSize
  const count = Math.round(between(state.bonusRng, TUNING.scoutCountMin, TUNING.scoutCountMax))
  const spacing = TUNING.scoutSpacing * blastMaxRadius(state.width, state.height) * TUNING.chainRadiusFraction
  const fromLeft = state.bonusRng() < 0.5
  const low = band.top + wobble + size / 2
  const high = band.bottom - wobble - size / 2
  const baseY = Math.min(Math.max(between(state.bonusRng, low, high), band.top), band.bottom)
  const speed = (state.width + spacing * count) / TUNING.scoutCrossSeconds
  return Array.from({ length: count }, (_, i) => {
    const x = fromLeft ? -size - i * spacing : state.width + size + i * spacing
    return { id: state.nextId++, pos: { x, y: baseY }, baseY, vx: fromLeft ? speed : -speed, size, phase: i * 0.9, age: 0 }
  })
}

const scoutY = (state: GameState, scout: Scout) => {
  const band = bonusBand(state)
  const amplitude = state.reducedMotion ? 0 : TUNING.scoutWobble * (band.bottom - band.top)
  return scout.baseY + amplitude * Math.sin(scout.age * Math.PI * 2 * TUNING.scoutWobbleHz + scout.phase)
}

// Hit radius of each target (a little inside its drawn size).
export const ufoHitRadius = (ufo: Ufo) => ufo.size * 0.35
export const scoutHitRadius = (scout: Scout) => scout.size * 0.45

function killingBlast(blasts: Blast[], x: number, y: number, radius: number): Blast | undefined {
  return blasts.find((blast) => distance(blast.pos, { x, y }) <= blastRadius(blast) + radius)
}

// Spawns this wave's bonus targets on schedule, moves them, drops the ones
// that have left the screen, and resolves hits from live blasts.
export function stepBonus(
  state: GameState,
  dt: number,
  addBlast: (kind: 'bonus', pos: { x: number; y: number }, chainId: number | null, radius: number) => void,
) {
  const plan = state.bonusPlan
  const before = plan.elapsed
  plan.elapsed += dt
  for (const time of plan.ufoTimes) if (before < time && plan.elapsed >= time) state.ufos.push(spawnUfo(state))
  if (plan.scoutTime !== null && before < plan.scoutTime && plan.elapsed >= plan.scoutTime) {
    state.scouts.push(...spawnScouts(state))
  }

  for (const ufo of state.ufos) {
    ufo.age += dt
    ufo.pos.x += ufo.vx * dt
  }
  for (const scout of state.scouts) {
    scout.age += dt
    scout.pos.x += scout.vx * dt
    scout.pos.y = scoutY(state, scout)
  }

  const destructive = state.blasts.filter((blast) => blast.kind !== 'impact' && blastRadius(blast) > 0)
  const full = blastMaxRadius(state.width, state.height)
  const onScreen = (x: number, margin: number, vx: number) => (vx > 0 ? x < state.width + margin : x > -margin)
  state.ufos = state.ufos.filter((ufo) => {
    const blast = killingBlast(destructive, ufo.pos.x, ufo.pos.y, ufoHitRadius(ufo))
    if (blast) {
      scoreKill(state, ufo.pos, TUNING.ufoPoints, blast.chainId, true)
      addBlast('bonus', ufo.pos, blast.chainId, full)
      return false
    }
    return onScreen(ufo.pos.x, ufo.size * 2, ufo.vx)
  })
  state.scouts = state.scouts.filter((scout) => {
    const blast = killingBlast(destructive, scout.pos.x, scout.pos.y, scoutHitRadius(scout))
    if (blast) {
      scoreKill(state, scout.pos, TUNING.scoutPoints, blast.chainId, true)
      addBlast('bonus', scout.pos, blast.chainId, full * TUNING.chainRadiusFraction)
      return false
    }
    // Checked against the far edge only: scouts start off screen, one
    // behind another, on the near side.
    return onScreen(scout.pos.x, scout.size * 2, scout.vx)
  })
}
