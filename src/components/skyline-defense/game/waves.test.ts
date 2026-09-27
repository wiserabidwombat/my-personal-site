import { describe, expect, it } from 'vitest'
import { createGame } from './engine'
import { TUNING } from './tuning'
import { spawnMeteor, splitMeteor, waveConfig } from './waves'

describe('waveConfig', () => {
  it('adds meteors and speed each wave, and spawns them closer together', () => {
    const [one, two, five] = [waveConfig(1), waveConfig(2), waveConfig(5)]
    expect(two.meteorCount).toBeGreaterThan(one.meteorCount)
    expect(five.meteorCount).toBeGreaterThan(two.meteorCount)
    expect(two.meteorSpeed).toBeGreaterThan(one.meteorSpeed)
    expect(five.spawnInterval).toBeLessThan(one.spawnInterval)
  })

  it('introduces splitting meteors only from the split wave on', () => {
    expect(waveConfig(TUNING.splitStartWave - 1).splitChance).toBe(0)
    expect(waveConfig(TUNING.splitStartWave).splitChance).toBeGreaterThan(0)
  })

  it('caps speed, spawn rate, and split chance on very late waves', () => {
    const late = waveConfig(200)
    expect(late.meteorSpeed).toBe(TUNING.meteorSpeedMax)
    expect(late.spawnInterval).toBe(TUNING.spawnIntervalMin)
    expect(late.splitChance).toBe(TUNING.splitChanceMax)
  })
})

describe('spawning', () => {
  it('spawns meteors above the sky heading down toward the ground', () => {
    const state = createGame(800, 600, () => 0.5)
    const meteor = spawnMeteor(state, waveConfig(1))
    expect(meteor.pos.y).toBeLessThan(0)
    expect(meteor.vel.y).toBeGreaterThan(0)
    expect(Math.hypot(meteor.vel.x, meteor.vel.y)).toBeCloseTo(waveConfig(1).meteorSpeed * 600)
  })

  it('splits into fragments that keep the speed and never split again', () => {
    const state = createGame(800, 600, () => 0.3)
    const parent = spawnMeteor(state, { ...waveConfig(5), splitChance: 1 })
    expect(parent.splitAtY).not.toBeNull()
    const fragments = splitMeteor(state, parent)
    expect(fragments).toHaveLength(TUNING.splitFragments)
    for (const fragment of fragments) {
      expect(fragment.splitAtY).toBeNull()
      expect(Math.hypot(fragment.vel.x, fragment.vel.y)).toBeCloseTo(Math.hypot(parent.vel.x, parent.vel.y))
    }
  })
})
