import { blastMaxRadius } from './geometry'
import { TUNING } from './tuning'
import type { GameState, Meteor, Vec, WaveConfig } from './types'

// 0 on phones, rising to 1 at TUNING.widePressureFullWidth and wider.
export function wideness(width: number): number {
  const span = TUNING.widePressureFullWidth - TUNING.widePressureMinWidth
  return Math.min(Math.max((width - TUNING.widePressureMinWidth) / span, 0), 1)
}

// Extra count/speed multiplier for wide screens (see TUNING.widePressure*).
export function widePressure(wave: number, width: number, perWave: number): number {
  const waves = wave - TUNING.widePressureStartWave + 1
  return waves > 0 ? 1 + wideness(width) * perWave * waves : 1
}

// Difficulty for wave n (1-based): more, faster meteors, spawning closer
// together, splitting meteors from TUNING.splitStartWave on, and salvos
// becoming more common. Speed is a fraction of world height per second.
// `width` adds the wide-screen pressure; omit it for the base values.
export function waveConfig(wave: number, width = 0): WaveConfig {
  const step = Math.max(wave, 1) - 1
  const splitting = wave >= TUNING.splitStartWave
  const baseSpeed = Math.min(TUNING.meteorSpeedBase + step * TUNING.meteorSpeedPerWave, TUNING.meteorSpeedMax)
  return {
    meteorCount: Math.round(
      (TUNING.meteorCountBase + step * TUNING.meteorCountPerWave) *
        widePressure(wave, width, TUNING.widePressureCountPerWave),
    ),
    meteorSpeed: baseSpeed * widePressure(wave, width, TUNING.widePressureSpeedPerWave),
    spawnInterval: Math.max(TUNING.spawnIntervalBase - step * TUNING.spawnIntervalPerWave, TUNING.spawnIntervalMin),
    splitChance: splitting
      ? Math.min(
          TUNING.splitChanceBase + (wave - TUNING.splitStartWave) * TUNING.splitChancePerWave,
          TUNING.splitChanceMax,
        )
      : 0,
    salvoChance: Math.min(TUNING.salvoChanceBase + step * TUNING.salvoChancePerWave, TUNING.salvoChanceMax),
    ammoPerLauncher: TUNING.ammoPerLauncher,
  }
}

const radians = (degrees: number) => (degrees * Math.PI) / 180

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

function rollSplit(state: GameState, config: WaveConfig): number | null {
  return state.rng() < config.splitChance ? state.height * (0.25 + state.rng() * 0.25) : null
}

function meteor(state: GameState, from: Vec, heading: number, speed: number, splitAtY: number | null): Meteor {
  return {
    id: state.nextId++,
    start: { ...from },
    pos: { ...from },
    vel: { x: Math.cos(heading) * speed, y: Math.sin(heading) * speed },
    splitAtY,
  }
}

// Salvo size for the next spawn: 1 (a single), 2, or 3, never more than
// the meteors left in the wave.
export function salvoSize(state: GameState, config: WaveConfig, remaining: number): number {
  if (remaining < 2 || state.rng() >= config.salvoChance) return 1
  return Math.min(state.rng() < TUNING.salvoTripleChance ? 3 : 2, remaining)
}

// One meteor, or a salvo: neighbors start TUNING.salvoSpacing blast radii
// apart, each a little later (higher up) than the last, with headings
// fanned TUNING.salvoFanDegrees apart around a shared aim. Each member can
// still be a splitting meteor.
export function spawnSalvo(state: GameState, config: WaveConfig, size: number): Meteor[] {
  const speed = config.meteorSpeed * state.height
  const lead = { x: state.rng() * state.width, y: -8 }
  const target = pickTarget(state)
  const heading = Math.atan2(target.y - lead.y, target.x - lead.x)
  const spacing = TUNING.salvoSpacing * blastMaxRadius(state.width)
  return Array.from({ length: size }, (_, index) => {
    const offset = index - (size - 1) / 2
    const from = {
      x: Math.min(Math.max(lead.x + offset * spacing, 0), state.width),
      y: lead.y - index * TUNING.salvoTimeGap * speed,
    }
    return meteor(state, from, heading + offset * radians(TUNING.salvoFanDegrees), speed, rollSplit(state, config))
  })
}

export function spawnMeteor(state: GameState, config: WaveConfig): Meteor {
  return spawnSalvo(state, config, 1)[0]
}

// Fragments of a split meteor: a fan around the parent's heading, starting
// from the split point, TUNING.splitFanDegrees apart, at the parent's
// speed. Fragments don't split again.
export function splitMeteor(state: GameState, parent: Meteor): Meteor[] {
  const speed = Math.hypot(parent.vel.x, parent.vel.y)
  const heading = Math.atan2(parent.vel.y, parent.vel.x)
  const count = TUNING.splitFragments
  return Array.from({ length: count }, (_, index) =>
    meteor(state, parent.pos, heading + (index - (count - 1) / 2) * radians(TUNING.splitFanDegrees), speed, null),
  )
}
