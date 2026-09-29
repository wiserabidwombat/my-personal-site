// Boss numbers by appearance, shared by the game and the leaderboard's
// plausibility ceiling (scoreboard.ts, which the server imports), so this
// file keeps its imports DOM-free with .js extensions.
import { TUNING } from './tuning.js'

export const isBossWave = (wave: number) => wave > 0 && wave % TUNING.bossEvery === 0

// 1 for the first boss wave, 2 for the second, ...
export const bossAppearance = (wave: number) => Math.floor(wave / TUNING.bossEvery)

const grow = (base: number, perAppearance: number, max: number, appearance: number) =>
  Math.min(base + (Math.max(appearance, 1) - 1) * perAppearance, max)

// Health, fragments shed per (non-final) hit, and descent speed (fraction of
// world height per second) for the nth appearance.
export function bossStats(appearance: number) {
  return {
    health: grow(TUNING.bossHealthBase, TUNING.bossHealthPerAppearance, TUNING.bossHealthMax, appearance),
    fragments: grow(TUNING.bossFragmentsBase, TUNING.bossFragmentsPerAppearance, TUNING.bossFragmentsMax, appearance),
    speed: grow(TUNING.bossSpeedBase, TUNING.bossSpeedPerAppearance, TUNING.bossSpeedMax, appearance),
  }
}

// Fragments the killing hit sheds.
export const killFragments = (fragments: number) => fragments * TUNING.bossKillFragmentScale
