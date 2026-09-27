import { describe, expect, it } from 'vitest'
import { bonusBand, planBonus, spawnScouts, spawnUfo } from './bonus'
import { chainMultiplier, killPoints, registerKill, scoreKill } from './chains'
import { blastMaxRadius, chainBlastRadius, createGame, fire, startGame, step } from './engine'
import { waveMultiplier } from './scoring'
import { TUNING } from './tuning'
import type { GameState, Meteor } from './types'

const meteorAt = (state: GameState, x: number, y: number): Meteor => ({
  id: state.nextId++,
  start: { x, y: 0 },
  pos: { x, y },
  vel: { x: 0, y: 0 },
  splitAtY: null,
})

function playing(wave = 1): GameState {
  const state = createGame(1000, 700, () => 0.5)
  state.hudBottom = 60
  startGame(state)
  state.wave = wave
  step(state, TUNING.waveTitleTime)
  state.toSpawn = 0
  state.meteors = []
  state.bonusPlan = { ufoTimes: [], scoutTime: null, elapsed: 0 }
  return state
}

describe('chain multiplier math', () => {
  it('multiplies the Nth kill in a chain by N, capped', () => {
    expect([1, 2, 3, 4].map(chainMultiplier)).toEqual([1, 2, 3, 4])
    expect(chainMultiplier(TUNING.chainMultiplierCap + 5)).toBe(TUNING.chainMultiplierCap)
    expect(chainMultiplier(0)).toBe(1)
  })

  it('scores base x wave multiplier x chain multiplier', () => {
    expect(killPoints(25, 1, 1)).toBe(25)
    expect(killPoints(25, 1, 3)).toBe(75)
    expect(killPoints(100, 3, 2)).toBe(100 * waveMultiplier(3) * 2)
    expect(killPoints(500, 1, 99)).toBe(500 * TUNING.chainMultiplierCap)
  })
})

describe('chain counting', () => {
  it('counts kills per chain, separately for each shot', () => {
    const state = playing()
    expect(registerKill(state, 7)).toBe(1)
    expect(registerKill(state, 7)).toBe(2)
    expect(registerKill(state, 8)).toBe(1)
    expect(registerKill(state, 7)).toBe(3)
    expect(state.waveLongestChain).toBe(3)
    // Kills with no chain (not caused by a shot) always count as a first kill.
    expect(registerKill(state, null)).toBe(1)
  })

  it('pops up +points for a first kill, then updates one popup per chain in place', () => {
    const state = playing()
    scoreKill(state, { x: 300, y: 300 }, 25, 5)
    expect(state.popups.map((p) => p.text)).toEqual(['+25'])
    scoreKill(state, { x: 330, y: 310 }, 25, 5)
    scoreKill(state, { x: 360, y: 290 }, 25, 5)
    // Still one popup, showing the multiplier and the chain's total so far.
    expect(state.popups).toHaveLength(1)
    expect(state.popups[0].text).toBe('CHAIN ×3  +150')
    expect(state.popups[0].kind).toBe('chain')
  })

  it("keeps a chain's popup anchored near the first kill and resets its timer on each update", () => {
    const state = playing()
    scoreKill(state, { x: 300, y: 300 }, 25, 5)
    state.popups[0].age = 0.5
    scoreKill(state, { x: 520, y: 180 }, 25, 5)
    const [popup] = state.popups
    expect(popup.pos.x).toBe(300)
    expect(popup.pos.y).toBeGreaterThan(280)
    expect(popup.age).toBe(0)
    // Lingers ~popupSeconds after the last kill, then fades out.
    step(state, TUNING.popupSeconds * 0.9)
    expect(state.popups).toHaveLength(1)
    step(state, TUNING.popupSeconds * 0.2)
    expect(state.popups).toHaveLength(0)
  })

  it('keeps popups below the HUD', () => {
    const state = playing()
    scoreKill(state, { x: 300, y: state.hudBottom - 30 }, 25, 5)
    scoreKill(state, { x: 300, y: state.hudBottom - 30 }, 25, 5)
    expect(state.popups[0].pos.y).toBeGreaterThan(state.hudBottom)
  })

  it('gives separate chains separate popups that do not overlap', () => {
    const state = playing()
    scoreKill(state, { x: 300, y: 200 }, 25, 5)
    scoreKill(state, { x: 320, y: 205 }, 25, 6)
    scoreKill(state, { x: 290, y: 195 }, 25, 7)
    expect(state.popups).toHaveLength(3)
    const ys = state.popups.map((p) => p.pos.y).sort((a, b) => a - b)
    for (let i = 1; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(12)
  })

  it('carries a shot through a chain reaction of meteors, doubling then tripling', () => {
    const state = playing()
    const r = chainBlastRadius(1000, 700)
    // Three meteors in a row, each within the previous one's chain blast.
    state.meteors.push(meteorAt(state, 500, 200), meteorAt(state, 500 + r * 0.7, 200), meteorAt(state, 500 + r * 1.4, 200))
    state.blasts.push({ id: 99, kind: 'interceptor', pos: { x: 500, y: 200 }, maxRadius: 5, age: TUNING.blastGrow, chainId: 42 })
    for (let i = 0; i < 80 && state.meteors.length > 0; i++) step(state, 0.02)
    expect(state.meteors).toHaveLength(0)
    expect(state.score).toBe(TUNING.meteorPoints * (1 + 2 + 3))
    expect(state.chains[42]).toBe(3)
    expect(state.waveLongestChain).toBe(3)
  })

  it('starts a new chain for each shot', () => {
    const state = playing()
    fire(state, { x: 300, y: 200 })
    fire(state, { x: 700, y: 200 })
    for (let i = 0; i < 40; i++) step(state, 0.02)
    const chainIds = new Set(state.blasts.filter((b) => b.kind === 'interceptor').map((b) => b.chainId))
    expect(chainIds.size).toBe(2)
  })
})

describe('bonus targets', () => {
  it('schedules a UFO from its start wave and scouts from theirs', () => {
    const state = playing()
    expect(planBonus(state, TUNING.ufoStartWave - 1).ufoTimes).toHaveLength(0)
    expect(planBonus(state, TUNING.ufoStartWave).ufoTimes).toHaveLength(1)
    expect(planBonus(state, TUNING.scoutStartWave - 1).scoutTime).toBeNull()
    const always = { ...state, bonusRng: () => 0 }
    expect(planBonus(always, TUNING.scoutStartWave).scoutTime).not.toBeNull()
    expect(planBonus(always, TUNING.ufoSecondPassWave).ufoTimes).toHaveLength(2)
  })

  it('keeps UFOs and scouts inside the sky band, below the HUD and above the skyline', () => {
    for (const [w, h] of [
      [1280, 741],
      [390, 791],
    ]) {
      const state = createGame(w, h, Math.random)
      state.hudBottom = 60
      const band = bonusBand(state)
      expect(band.top).toBeGreaterThan(state.hudBottom)
      for (let i = 0; i < 50; i++) {
        const ufo = spawnUfo(state)
        expect(ufo.pos.y).toBeGreaterThanOrEqual(band.top)
        expect(ufo.pos.y).toBeLessThanOrEqual(band.bottom)
        for (const scout of spawnScouts(state)) {
          expect(scout.baseY).toBeGreaterThanOrEqual(band.top)
          expect(scout.baseY).toBeLessThanOrEqual(band.bottom)
        }
      }
    }
  })

  it('scores a UFO with the wave multiplier and leaves a full-size blast in the same chain', () => {
    const state = playing(3)
    const ufo = spawnUfo(state)
    ufo.vx = 0
    ufo.pos = { x: 500, y: 150 }
    state.ufos.push(ufo)
    state.blasts.push({ id: 99, kind: 'interceptor', pos: { x: 500, y: 150 }, maxRadius: 40, age: TUNING.blastGrow, chainId: 9 })
    step(state, 0.01)
    expect(state.ufos).toHaveLength(0)
    expect(state.score).toBe(TUNING.ufoPoints * waveMultiplier(3))
    const blast = state.blasts.find((b) => b.kind === 'bonus')
    expect(blast?.maxRadius).toBeCloseTo(blastMaxRadius(1000, 700))
    expect(blast?.chainId).toBe(9)
  })

  it('spaces scouts so one scout blast can chain through the line', () => {
    const state = playing(3)
    const scouts = spawnScouts(state)
    expect(scouts.length).toBeGreaterThanOrEqual(TUNING.scoutCountMin)
    expect(scouts.length).toBeLessThanOrEqual(TUNING.scoutCountMax)
    const gap = Math.abs(scouts[1].pos.x - scouts[0].pos.x)
    expect(gap).toBeLessThan(chainBlastRadius(1000, 700))
  })

  it('never damages buildings', () => {
    const state = playing(3)
    state.ufos.push({ ...spawnUfo(state), pos: { x: 100, y: state.groundY - 5 } })
    for (let i = 0; i < 100; i++) step(state, 0.05)
    expect(state.buildings.every((b) => b.alive)).toBe(true)
  })
})
