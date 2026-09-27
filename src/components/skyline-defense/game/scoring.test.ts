import { describe, expect, it } from 'vitest'
import { meteorPoints, waveBonus, waveMultiplier } from './scoring'
import { TUNING } from './tuning'

describe('scoring', () => {
  it('raises the multiplier every two waves, capped at x6', () => {
    expect([1, 2, 3, 4, 5].map(waveMultiplier)).toEqual([1, 1, 2, 2, 3])
    expect(waveMultiplier(99)).toBe(6)
  })

  it('scores meteors with the wave multiplier', () => {
    expect(meteorPoints(1)).toBe(TUNING.meteorPoints)
    expect(meteorPoints(3)).toBe(TUNING.meteorPoints * 2)
  })

  it('pays a bonus for surviving buildings and leftover ammo', () => {
    const bonus = waveBonus(4, 7, 1)
    expect(bonus.buildings).toBe(4 * TUNING.buildingBonus)
    expect(bonus.ammo).toBe(7 * TUNING.ammoBonus)
    expect(bonus.total).toBe(bonus.buildings + bonus.ammo)
    expect(waveBonus(4, 7, 3).total).toBe(bonus.total * 2)
    expect(waveBonus(0, 0, 1).total).toBe(0)
  })
})
