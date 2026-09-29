import { afterEach, describe, expect, it, vi } from 'vitest'
import { bossStats } from './game/bossStats'
import { createGame, startGame, totalAmmo } from './game/engine'
import { waveMultiplier } from './game/scoring'
import { TUNING } from './game/tuning'
import { waveConfig } from './game/waves'
import { canSubmit, personalBestAfter, TEST_WAVE_MAX, testWaveFromUrl } from './testRun'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('?wave=N test runs', () => {
  it('are ignored outside dev', () => {
    vi.stubEnv('DEV', false)
    expect(testWaveFromUrl('?wave=10')).toBeNull()
  })

  it('read a positive integer, clamped to the maximum', () => {
    vi.stubEnv('DEV', true)
    expect(testWaveFromUrl('?wave=10')).toBe(10)
    expect(testWaveFromUrl('?foo=1&wave=5')).toBe(5)
    expect(testWaveFromUrl(`?wave=${TEST_WAVE_MAX + 50}`)).toBe(TEST_WAVE_MAX)
  })

  it('ignore missing or invalid values', () => {
    vi.stubEnv('DEV', true)
    for (const search of ['', '?wave', '?wave=', '?wave=0', '?wave=-3', '?wave=2.5', '?wave=abc', '?wave=5x', '?wave=%205', '?wave=05', '?wave=1e3']) {
      expect(testWaveFromUrl(search)).toBeNull()
    }
  })

  it('start as if the player just arrived: full city, score 0, that wave\'s ammo, multiplier and boss', () => {
    for (const [wave, appearance] of [
      [5, 1],
      [10, 2],
      [15, 3],
    ]) {
      const state = createGame(1000, 700, () => 0.5)
      state.score = 999
      startGame(state, wave)
      expect(state.wave).toBe(wave)
      expect(state.score).toBe(0)
      expect(state.buildings.every((b) => b.alive)).toBe(true)
      expect(totalAmmo(state)).toBe(waveConfig(wave).ammoPerLauncher * state.launchers.length)
      expect(state.boss?.appearance).toBe(appearance)
      expect(state.boss?.health).toBe(bossStats(appearance).health)
      expect(state.boss?.fragments).toBe(bossStats(appearance).fragments)
    }
    const state = createGame(1000, 700, () => 0.5)
    startGame(state, 7)
    expect(state.boss).toBeNull()
    expect(state.toSpawn).toBe(waveConfig(7, 1000).meteorCount)
    expect(waveMultiplier(state.wave)).toBe(4)
    expect(TUNING.bossEvery).toBe(5)
  })

  it('never save a personal best or offer leaderboard entry', () => {
    const board = [{ score: 100 }]
    expect(personalBestAfter(50_000, 1_000, 10)).toEqual({ best: 1_000, newHighScore: false, save: false })
    expect(canSubmit(10, 50_000, board)).toBe(false)
    // A normal run with the same score does.
    expect(personalBestAfter(50_000, 1_000, null)).toEqual({ best: 50_000, newHighScore: true, save: true })
    expect(personalBestAfter(500, 1_000, null)).toEqual({ best: 1_000, newHighScore: false, save: false })
    expect(canSubmit(null, 50_000, board)).toBe(true)
  })
})
