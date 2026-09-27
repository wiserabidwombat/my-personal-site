import { TUNING } from './tuning'
import type { GameState, Meteor, Vec, WaveConfig } from './types'

// Difficulty for wave n (1-based): more, faster meteors, spawning closer
// together, and splitting meteors from TUNING.splitStartWave on. Speed is
// a fraction of world height per second.
export function waveConfig(wave: number): WaveConfig {
  const step = Math.max(wave, 1) - 1
  const splitting = wave >= TUNING.splitStartWave
  return {
    meteorCount: TUNING.meteorCountBase + step * TUNING.meteorCountPerWave,
    meteorSpeed: Math.min(TUNING.meteorSpeedBase + step * TUNING.meteorSpeedPerWave, TUNING.meteorSpeedMax),
    spawnInterval: Math.max(TUNING.spawnIntervalBase - step * TUNING.spawnIntervalPerWave, TUNING.spawnIntervalMin),
    splitChance: splitting
      ? Math.min(
          TUNING.splitChanceBase + (wave - TUNING.splitStartWave) * TUNING.splitChancePerWave,
          TUNING.splitChanceMax,
        )
      : 0,
    ammoPerLauncher: TUNING.ammoPerLauncher,
  }
}

// A point on the ground to aim at: mostly lit buildings, sometimes a
// random spot (which may still clip a building on the way down).
function pickTarget(state: GameState): Vec {
  const alive = state.buildings.filter((building) => building.alive)
  if (alive.length > 0 && state.rng() < 0.75) {
    const building = alive[Math.floor(state.rng() * alive.length)]
    return { x: building.x + (state.rng() - 0.5) * building.width * 0.6, y: state.groundY }
  }
  return { x: state.rng() * state.width, y: state.groundY }
}

function meteorToward(state: GameState, from: Vec, target: Vec, speed: number, splitAtY: number | null): Meteor {
  const dx = target.x - from.x
  const dy = target.y - from.y
  const length = Math.hypot(dx, dy) || 1
  return {
    id: state.nextId++,
    start: { ...from },
    pos: { ...from },
    vel: { x: (dx / length) * speed, y: (dy / length) * speed },
    splitAtY,
  }
}

export function spawnMeteor(state: GameState, config: WaveConfig): Meteor {
  const from = { x: state.rng() * state.width, y: -8 }
  const splits = state.rng() < config.splitChance
  const splitAtY = splits ? state.height * (0.25 + state.rng() * 0.25) : null
  return meteorToward(state, from, pickTarget(state), config.meteorSpeed * state.height, splitAtY)
}

// Fragments of a split meteor, each heading for its own target at the
// parent's speed. Fragments don't split again.
export function splitMeteor(state: GameState, meteor: Meteor): Meteor[] {
  const speed = Math.hypot(meteor.vel.x, meteor.vel.y)
  return Array.from({ length: TUNING.splitFragments }, () =>
    meteorToward(state, meteor.pos, pickTarget(state), speed, null),
  )
}
