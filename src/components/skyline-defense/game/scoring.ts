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
// interceptor.
export function waveBonus(buildingsAlive: number, ammoLeft: number, wave: number): WaveBonus {
  const multiplier = waveMultiplier(wave)
  const buildings = buildingsAlive * TUNING.buildingBonus * multiplier
  const ammo = ammoLeft * TUNING.ammoBonus * multiplier
  return { buildings, ammo, total: buildings + ammo }
}
