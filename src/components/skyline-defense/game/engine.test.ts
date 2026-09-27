import { describe, expect, it } from 'vitest'
import { beginWave, blastMaxRadius, chainBlastRadius, createGame, fire, startGame, step, totalAmmo } from './engine'
import { blastLifetime } from './geometry'
import { resizeWorld } from './resize'
import { meteorPoints } from './scoring'
import { TUNING } from './tuning'
import type { Building, GameState, Meteor } from './types'
import { waveConfig } from './waves'

const meteorAt = (state: GameState, x: number, y: number): Meteor => ({
  id: state.nextId++,
  start: { x, y: 0 },
  pos: { x, y },
  vel: { x: 0, y: 0 },
  splitAtY: null,
})

// A point inside a building's outline (the average of its first polygon's
// corners -- inside for the convex shapes used here).
function insideOf(building: Building) {
  const polygon = building.outline[0]
  return {
    x: polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length,
    y: polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length,
  }
}

// A game in its first 'playing' frame with nothing in the sky and nothing
// left to spawn (the step that starts play also spawns the first meteor).
function playing(): GameState {
  const state = createGame(1000, 700, () => 0.5)
  startGame(state)
  step(state, TUNING.waveTitleTime)
  state.toSpawn = 0
  state.meteors = []
  return state
}

describe('firing', () => {
  it('fires from the nearest launcher and spends its ammo', () => {
    const state = playing()
    const [left, center] = state.launchers
    expect(fire(state, { x: 60, y: 200 })).toBe(true)
    expect(left.ammo).toBe(TUNING.ammoPerLauncher - 1)
    expect(center.ammo).toBe(TUNING.ammoPerLauncher)
    expect(state.interceptors).toHaveLength(1)
  })

  it('ignores clicks outside play and when every launcher is empty', () => {
    const state = createGame(1000, 700)
    expect(fire(state, { x: 10, y: 10 })).toBe(false)
    const game = playing()
    for (const launcher of game.launchers) launcher.ammo = 0
    expect(fire(game, { x: 10, y: 10 })).toBe(false)
  })
})

describe('collisions', () => {
  it('destroys meteors inside a blast, scores them, and chains a new blast', () => {
    const state = playing()
    state.meteors.push(meteorAt(state, 500, 200))
    state.blasts.push({ id: 99, kind: 'interceptor', pos: { x: 500, y: 200 }, maxRadius: 40, age: TUNING.blastGrow, chainId: 99 })
    step(state, 0.01)
    expect(state.meteors).toHaveLength(0)
    expect(state.score).toBe(meteorPoints(1))
    expect(state.blasts.some((blast) => blast.kind === 'chain')).toBe(true)
  })

  it('gives a chain blast about 60% of a full blast radius', () => {
    const state = playing()
    state.meteors.push(meteorAt(state, 500, 200))
    state.blasts.push({ id: 99, kind: 'interceptor', pos: { x: 500, y: 200 }, maxRadius: 40, age: TUNING.blastGrow, chainId: 99 })
    step(state, 0.01)
    const chain = state.blasts.find((blast) => blast.kind === 'chain')
    expect(chain?.maxRadius).toBeCloseTo(blastMaxRadius(1000, 700) * TUNING.chainRadiusFraction)
  })

  it('stays lethal while shrinking', () => {
    const state = playing()
    state.meteors.push(meteorAt(state, 500, 200))
    const age = blastLifetime - TUNING.blastShrink / 2
    state.blasts.push({ id: 99, kind: 'interceptor', pos: { x: 505, y: 200 }, maxRadius: 40, age, chainId: 99 })
    step(state, 0.01)
    expect(state.meteors).toHaveLength(0)
  })

  it('lets a chain blast catch a nearby meteor on a later frame', () => {
    const state = playing()
    state.meteors.push(meteorAt(state, 500, 200), meteorAt(state, 500 + chainBlastRadius(1000, 700) * 0.8, 200))
    state.blasts.push({ id: 99, kind: 'interceptor', pos: { x: 500, y: 200 }, maxRadius: 5, age: TUNING.blastGrow, chainId: 99 })
    step(state, 0.01)
    expect(state.meteors).toHaveLength(1)
    for (let i = 0; i < 40 && state.meteors.length > 0; i++) step(state, 0.02)
    expect(state.meteors).toHaveLength(0)
    // The second kill in the chain scores double.
    expect(state.score).toBe(meteorPoints(1) * (1 + 2))
  })

  it('darkens a building a meteor reaches, and ends the game when all are dark', () => {
    const state = playing()
    // Meteors still to come, so the wave doesn't end after the first hit.
    state.toSpawn = 5
    state.spawnTimer = 999
    const [first, ...rest] = state.buildings
    const firstPoint = insideOf(first)
    state.meteors.push(meteorAt(state, firstPoint.x, firstPoint.y))
    step(state, 0.01)
    expect(first.alive).toBe(false)
    expect(state.phase).toBe('playing')
    for (const building of rest) {
      const point = insideOf(building)
      state.meteors.push(meteorAt(state, point.x, point.y))
    }
    step(state, 0.01)
    expect(state.phase).toBe('gameOver')
  })
})

describe('wave progression', () => {
  it('pays the bonus once a wave is cleared, then starts the next wave with more meteors and full ammo', () => {
    const state = playing()
    fire(state, { x: 500, y: 100 })
    for (let i = 0; i < 200 && state.phase === 'playing'; i++) step(state, 0.05)
    expect(state.phase).toBe('waveBonus')
    const alive = state.buildings.filter((building) => building.alive).length
    expect(state.lastBonus?.buildings).toBe(alive * TUNING.buildingBonus)
    expect(state.lastBonus?.ammo).toBe((TUNING.ammoPerLauncher * 3 - 1) * TUNING.ammoBonus)
    expect(state.score).toBe(state.lastBonus?.total)

    step(state, TUNING.waveBonusTime)
    expect(state.phase).toBe('waveTitle')
    expect(state.wave).toBe(2)
    expect(state.toSpawn).toBe(waveConfig(2).meteorCount)
    expect(totalAmmo(state)).toBe(TUNING.ammoPerLauncher * 3)
  })

  it('keeps dark buildings dark into the next wave', () => {
    const state = playing()
    state.buildings[0].alive = false
    beginWave(state, 2)
    expect(state.buildings[0].alive).toBe(false)
  })
})

describe('resizeWorld', () => {
  it('keeps dark buildings and ammo, and scales meteors with the world', () => {
    const state = playing()
    state.buildings[0].alive = false
    state.launchers[1].ammo = 4
    state.meteors.push(meteorAt(state, 500, 350))
    resizeWorld(state, 500, 350)
    expect(state.buildings.find((b) => b.name === 'Reunion Tower')?.alive).toBe(false)
    expect(state.launchers[1].ammo).toBe(4)
    expect(state.meteors[0].pos).toEqual({ x: 250, y: 175 })
  })
})
