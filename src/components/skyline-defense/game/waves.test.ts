import { describe, expect, it } from 'vitest'
import { createGame, startGame, step } from './engine'
import { TUNING } from './tuning'
import { blastMaxRadius } from './geometry'
import { salvoSize, spawnMeteor, spawnSalvo, splitMeteor, waveConfig, wideness } from './waves'

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

  it('keeps wave 1 mostly singles and makes salvos common by waves 2-3', () => {
    expect(waveConfig(1).salvoChance).toBeLessThan(0.2)
    expect(waveConfig(2).salvoChance).toBeGreaterThan(waveConfig(1).salvoChance)
    expect(waveConfig(3).salvoChance).toBeGreaterThanOrEqual(0.5)
    expect(waveConfig(200).salvoChance).toBe(TUNING.salvoChanceMax)
  })

  it('adds wide-screen pressure only on wide screens and only from the start wave', () => {
    expect(wideness(390)).toBe(0)
    expect(wideness(430)).toBe(0)
    expect(wideness(1280)).toBe(1)
    expect(wideness(1920)).toBe(1)
    const start = TUNING.widePressureStartWave
    // Phones and the early waves get the base values.
    expect(waveConfig(start + 2, 390)).toEqual(waveConfig(start + 2))
    expect(waveConfig(start - 1, 1280)).toEqual(waveConfig(start - 1))
    // Desktop from the start wave on: more meteors, faster.
    expect(waveConfig(start + 2, 1280).meteorCount).toBeGreaterThan(waveConfig(start + 2).meteorCount)
    expect(waveConfig(start + 2, 1280).meteorSpeed).toBeGreaterThan(waveConfig(start + 2).meteorSpeed)
    expect(waveConfig(start + 2, 800).meteorCount).toBeLessThanOrEqual(waveConfig(start + 2, 1280).meteorCount)
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

  it('splits into a fan of fragments from one point that keep the speed and never split again', () => {
    const state = createGame(800, 600, () => 0.3)
    const parent = spawnMeteor(state, { ...waveConfig(5), splitChance: 1 })
    expect(parent.splitAtY).not.toBeNull()
    const fragments = splitMeteor(state, parent)
    expect(fragments).toHaveLength(TUNING.splitFragments)
    const headings = fragments.map((f) => (Math.atan2(f.vel.y, f.vel.x) * 180) / Math.PI).sort((a, b) => a - b)
    for (let i = 1; i < headings.length; i++) expect(headings[i] - headings[i - 1]).toBeCloseTo(TUNING.splitFanDegrees)
    for (const fragment of fragments) {
      expect(fragment.pos).toEqual(parent.pos)
      expect(fragment.splitAtY).toBeNull()
      expect(Math.hypot(fragment.vel.x, fragment.vel.y)).toBeCloseTo(Math.hypot(parent.vel.x, parent.vel.y))
    }
    // Still inside one full blast half a second after splitting.
    const spread = Math.hypot(fragments[0].vel.x - fragments[2].vel.x, fragments[0].vel.y - fragments[2].vel.y) * 0.5
    expect(spread).toBeLessThan(blastMaxRadius(800) * 2)
  })
})

describe('salvos', () => {
  it('sizes salvos 1-3 and never beyond the meteors left', () => {
    const config = { ...waveConfig(3), salvoChance: 1 }
    expect(salvoSize(createGame(800, 600, () => 0.1), config, 5)).toBe(3)
    expect(salvoSize(createGame(800, 600, () => 0.9), config, 5)).toBe(2)
    expect(salvoSize(createGame(800, 600, () => 0.1), config, 2)).toBe(2)
    expect(salvoSize(createGame(800, 600, () => 0.1), config, 1)).toBe(1)
    expect(salvoSize(createGame(800, 600, () => 0.1), { ...config, salvoChance: 0 }, 5)).toBe(1)
  })

  it('starts members close together, staggered, and fanning out at the same speed', () => {
    const state = createGame(800, 600, () => 0.5)
    const config = waveConfig(3)
    const salvo = spawnSalvo(state, config, 3)
    expect(salvo).toHaveLength(3)
    const spacing = TUNING.salvoSpacing * blastMaxRadius(800)
    expect(salvo[1].pos.x - salvo[0].pos.x).toBeCloseTo(spacing)
    expect(salvo[1].pos.y).toBeLessThan(salvo[0].pos.y)
    expect(salvo[2].pos.y).toBeLessThan(salvo[1].pos.y)
    const headings = salvo.map((m) => (Math.atan2(m.vel.y, m.vel.x) * 180) / Math.PI)
    expect(headings[1] - headings[0]).toBeCloseTo(TUNING.salvoFanDegrees)
    for (const m of salvo) expect(Math.hypot(m.vel.x, m.vel.y)).toBeCloseTo(config.meteorSpeed * 600)
    expect(new Set(salvo.map((m) => m.id)).size).toBe(3)
  })

  it("keeps the wave's meteor count and average spawn rate with salvos", () => {
    const state = createGame(1000, 700, () => 0.05)
    startGame(state)
    step(state, TUNING.waveTitleTime)
    const spawned = state.meteors.length
    expect(spawned).toBeGreaterThan(1)
    expect(state.toSpawn).toBe(waveConfig(1).meteorCount - spawned)
    expect(state.spawnTimer).toBeCloseTo(waveConfig(1).spawnInterval * spawned)
  })
})
