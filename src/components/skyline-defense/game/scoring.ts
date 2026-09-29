import { TUNING } from './tuning.js'
import type { WaveBonus } from './types.js'

// Points multiplier: x1 for waves 1-2, x2 for 3-4, and so on, up to x6.
export function waveMultiplier(wave: number): number {
  return Math.min(1 + Math.floor((Math.max(wave, 1) - 1) / 2), 6)
}

export function meteorPoints(wave: number): number {
  return TUNING.meteorPoints * waveMultiplier(wave)
}

// End-of-wave bonus for every building still lit and every unused
// interceptor, plus the boss bonus when a boss was destroyed before it
// reached the city.
export function waveBonus(buildingsAlive: number, ammoLeft: number, wave: number, bossDestroyed = false): WaveBonus {
  const multiplier = waveMultiplier(wave)
  const buildings = buildingsAlive * TUNING.buildingBonus * multiplier
  const ammo = ammoLeft * TUNING.ammoBonus * multiplier
  const boss = bossDestroyed ? TUNING.bossBonus * multiplier : 0
  return { buildings, ammo, boss, total: buildings + ammo + boss }
}
