import { describe, expect, it } from 'vitest'
import { bossHitRadius, bossRadius } from './boss'
import { bossAppearance, bossStats, isBossWave, killFragments } from './bossStats'
import { beginWave, blastMaxRadius, createGame, startGame, step } from './engine'
import { waveMultiplier } from './scoring'
import { TUNING } from './tuning'
import type { GameState } from './types'

const DT = 1 / 60

// A game on its first boss wave, past the title, with the boss parked in
// the middle of the sky.
function bossFight(rng: () => number = () => 0.5, bossRng: () => number = () => 0.4): GameState {
  const state = createGame(1000, 700, rng, () => 0.5, bossRng)
  startGame(state)
  beginWave(state, TUNING.bossEvery)
  while (state.phase !== 'playing') step(state, DT)
  state.boss!.pos = { x: 500, y: 250 }
  return state
}

// A blast from shot `chainId` at full size, centered on the boss.
function blastOnBoss(state: GameState, chainId: number) {
  const pos = { ...state.boss!.pos }
  state.blasts.push({ id: state.nextId++, kind: 'interceptor', pos, maxRadius: 40, age: TUNING.blastGrow, chainId })
}

describe('boss waves', () => {
  it('come every bossEvery waves, and get tougher per appearance up to the caps', () => {
    expect([1, 4, 5, 6, 10, 15].map(isBossWave)).toEqual([false, false, true, false, true, true])
    expect(bossAppearance(TUNING.bossEvery * 2)).toBe(2)
    const [first, second] = [bossStats(1), bossStats(2)]
    expect(first).toEqual({ health: TUNING.bossHealthBase, fragments: TUNING.bossFragmentsBase, speed: TUNING.bossSpeedBase })
    expect(second.health).toBeGreaterThan(first.health)
    expect(second.fragments).toBeGreaterThan(first.fragments)
    expect(second.speed).toBeGreaterThan(first.speed)
    expect(bossStats(99)).toEqual({
      health: TUNING.bossHealthMax,
      fragments: TUNING.bossFragmentsMax,
      speed: TUNING.bossSpeedMax,
    })
  })

  it('replace the normal spawns with one boss bigger than a full blast', () => {
    const state = bossFight()
    expect(state.toSpawn).toBe(0)
    expect(state.boss?.health).toBe(TUNING.bossHealthBase)
    expect(state.boss!.radius).toBeGreaterThan(blastMaxRadius(1000, 700))
    for (const [w, h] of [
      [390, 791],
      [360, 640],
    ]) {
      expect(bossRadius(w, h)).toBeGreaterThan(blastMaxRadius(w, h) * 0.8)
    }
    beginWave(state, TUNING.bossEvery + 1)
    expect(state.boss).toBeNull()
    expect(state.toSpawn).toBeGreaterThan(0)
  })

  it('never draw from the meteor stream', () => {
    let calls = 0
    const rng = () => {
      calls++
      return 0.5
    }
    const state = bossFight(rng)
    state.boss!.pos.y = -state.boss!.radius
    const before = calls
    for (let t = 0; t < 8; t += DT) step(state, DT)
    expect(state.trickleSpawned).toBeGreaterThan(0)
    expect(calls).toBe(before)
  })
})

describe('boss hits', () => {
  it('take one point per shot, stall and knock it back, and shed fragments immune to that shot', () => {
    const state = bossFight()
    const boss = state.boss!
    blastOnBoss(state, 900)
    step(state, DT)
    expect(boss.health).toBe(TUNING.bossHealthBase - 1)
    expect(boss.flash).toBeGreaterThan(0)
    expect(boss.stall).toBeGreaterThan(0)
    expect(boss.pos.y).toBeLessThan(250)
    const fragments = state.meteors.filter((m) => m.immuneChain === 900)
    expect(fragments).toHaveLength(TUNING.bossFragmentsBase)
    for (const fragment of fragments) expect(fragment.vel.y).toBeGreaterThan(0)

    // The same shot's blasts never hit it again, and its fragments survive them.
    for (let i = 0; i < 20; i++) step(state, DT)
    expect(boss.health).toBe(TUNING.bossHealthBase - 1)
    expect(state.meteors.filter((m) => m.immuneChain === 900)).toHaveLength(TUNING.bossFragmentsBase)

    // Another shot's blast does.
    blastOnBoss(state, 901)
    step(state, DT)
    expect(boss.health).toBe(TUNING.bossHealthBase - 2)
  })

  it('count a blast that only grazes its glow', () => {
    const state = bossFight()
    const boss = state.boss!
    const reach = 40 + bossHitRadius(boss) - 1
    state.blasts.push({ id: 1, kind: 'chain', pos: { x: boss.pos.x + reach, y: boss.pos.y }, maxRadius: 40, age: 0.5, chainId: 5 })
    step(state, DT)
    expect(boss.health).toBe(TUNING.bossHealthBase - 1)
  })

  it('on the last point destroy it for boss points, a big blast and a burst of fragments; the wave then pays the boss bonus', () => {
    const state = bossFight()
    state.boss!.health = 1
    const score = state.score
    blastOnBoss(state, 900)
    step(state, DT)
    expect(state.boss).toBeNull()
    expect(state.bossOutcome).toBe('destroyed')
    expect(state.score - score).toBe(TUNING.bossPoints * waveMultiplier(TUNING.bossEvery))
    expect(state.meteors.filter((m) => m.immuneChain === 900)).toHaveLength(killFragments(TUNING.bossFragmentsBase))
    expect(state.blasts.some((b) => b.maxRadius > blastMaxRadius(1000, 700) * 1.5)).toBe(true)

    // Clear the sky: the wave ends with the boss bonus.
    state.meteors = []
    for (let t = 0; t < 3 && state.phase === 'playing'; t += DT) {
      state.meteors = []
      step(state, DT)
    }
    expect(state.phase).toBe('waveBonus')
    expect(state.lastBonus?.boss).toBe(TUNING.bossBonus * waveMultiplier(TUNING.bossEvery))
  })
})

describe('boss impact', () => {
  it('knocks out every building within the impact radius, shakes, and pays no boss bonus', () => {
    const state = bossFight()
    const boss = state.boss!
    boss.pos = { x: 500, y: state.groundY - boss.radius * 0.8 + 1 }
    step(state, DT)
    expect(state.boss).toBeNull()
    expect(state.bossOutcome).toBe('impact')
    expect(state.shake).toBeGreaterThan(0)
    const reach = TUNING.bossImpactRadiusFraction * state.width
    for (const building of state.buildings) {
      if (Math.abs(building.x - 500) <= reach) expect(building.alive).toBe(false)
    }
    expect(state.buildings.some((b) => Math.abs(b.x - 500) > reach && b.alive)).toBe(true)

    for (let t = 0; t < 3 && state.phase === 'playing'; t += DT) {
      state.meteors = []
      step(state, DT)
    }
    expect(state.phase).toBe('waveBonus')
    expect(state.lastBonus?.boss).toBe(0)
  })

  it("holds the wave open while the boss is alive, even with the sky otherwise clear", () => {
    const state = bossFight()
    for (let t = 0; t < 2; t += DT) {
      state.meteors = []
      step(state, DT)
    }
    expect(state.phase).toBe('playing')
    expect(state.boss).not.toBeNull()
  })
})
