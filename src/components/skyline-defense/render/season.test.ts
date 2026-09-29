import { beforeAll, describe, expect, it } from 'vitest'
import { createGame, fire, startGame, step } from '../game/engine'
import type { GameState } from '../game/types'
import { SEASON_COLORS, type Palette, type Season } from './palette'
import { renderGame } from './renderGame'

// A 2D context that accepts every call and draws nothing (tests run without
// a DOM), so the full renderer can run alongside the engine.
function fakeContext(): CanvasRenderingContext2D {
  const gradient = { addColorStop: () => {} }
  const target: Record<string | symbol, unknown> = {}
  return new Proxy(target, {
    get(obj, key) {
      if (key in obj) return obj[key]
      if (key === 'measureText') return () => ({ width: 40 })
      if (typeof key === 'string' && key.startsWith('create')) return () => gradient
      return () => {}
    },
    set(obj, key, value) {
      obj[key] = value
      return true
    },
  }) as unknown as CanvasRenderingContext2D
}

beforeAll(() => {
  // Path2D is a browser API; the renderer only builds paths to fill them.
  globalThis.Path2D ??= class {
    moveTo() {}
    lineTo() {}
    closePath() {}
    ellipse() {}
    arc() {}
    quadraticCurveTo() {}
    addPath() {}
  } as unknown as typeof Path2D
})

const palette = (season: Season): Palette => ({
  season,
  sky: '#0a0612',
  skyHigh: '#150a24',
  pink: season === 'halloween' ? '#ff7a1a' : '#ff2bd6',
  cyan: season === 'halloween' ? '#7dff3a' : '#00f0ff',
  purple: '#8b2fe0',
  ...SEASON_COLORS[season],
})

function seeded(seed: number): () => number {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

// Plays a seeded game through the first boss wave, firing at the lowest
// meteor (or the boss) every half second, drawing every frame in `season`.
function play(season: Season): GameState {
  const state = createGame(1000, 700, seeded(11), seeded(23), seeded(37))
  const ctx = fakeContext()
  startGame(state, 4)
  const dt = 1 / 60
  for (let frame = 0; frame < 60 * 70 && state.phase !== 'gameOver'; frame++) {
    step(state, dt)
    if (frame % 30 === 0) {
      const lowest = [...state.meteors].sort((a, b) => b.pos.y - a.pos.y)[0]
      const target = state.boss && frame % 60 === 0 ? state.boss.pos : lowest?.pos
      if (target) fire(state, { x: target.x, y: target.y + 20 })
    }
    renderGame(ctx, state, {
      palette: palette(season),
      time: frame * dt,
      still: false,
      highScore: 0,
      crosshair: null,
      city: null,
      testWave: null,
    })
  }
  return state
}

// Everything but the random-number functions, which can't be compared.
const snapshot = (state: GameState) =>
  JSON.parse(JSON.stringify({ ...state, rng: null, bonusRng: null, bossRng: null })) as unknown

describe('the Halloween look', () => {
  it('leaves the game identical: same seed, same engine state with the season on and off', () => {
    const normal = play('none')
    const halloween = play('halloween')
    // The run really reached and fought the boss wave.
    expect(normal.wave).toBeGreaterThanOrEqual(5)
    expect(normal.score).toBeGreaterThan(0)
    expect(snapshot(halloween)).toEqual(snapshot(normal))
  })
})
