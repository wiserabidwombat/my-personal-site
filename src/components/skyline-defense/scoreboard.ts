// Rules for the global Top 10, shared by the game (client) and api/scores.ts
// (server) so both agree on what a valid entry is and what qualifies. Pure
// and DOM-free, so the serverless function can import it. Relative imports in
// this file and the game files it imports keep their .js extensions: Vercel
// runs api/ as native ES modules, which need them (Vite and TypeScript
// resolve .js to the .ts source).
import { waveBonus, waveMultiplier } from './game/scoring.js'
import { launcherFractions, REGIONS } from './game/skyline.js'
import { TUNING } from './game/tuning.js'
import { waveConfig } from './game/waves.js'

export const BOARD_SIZE = 10

export type ScoreEntry = {
  id: number
  rank: number
  initials: string
  score: number
  wave: number
  createdAt: string
}

// Uppercases and trims initials; returns them if they're exactly three
// letters A-Z, otherwise null.
export function normalizeInitials(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const initials = raw.trim().toUpperCase()
  return /^[A-Z]{3}$/.test(initials) ? initials : null
}

type Unranked = Omit<ScoreEntry, 'rank'>

// The board order: highest score first, and on a tie the earlier entry
// (then the lower id) ranks higher. Ranks are 1..BOARD_SIZE with no ties.
export function rankEntries(entries: Unranked[]): ScoreEntry[] {
  return [...entries]
    .sort((a, b) => b.score - a.score || Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id - b.id)
    .slice(0, BOARD_SIZE)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}

// Whether a score would make the board: it has an open spot, or the score
// beats 10th place. Matching 10th place doesn't qualify, since ties go to
// the earlier entry.
export function qualifies(score: number, board: readonly { score: number }[]): boolean {
  if (!(score > 0)) return false
  return board.length < BOARD_SIZE || score > board[BOARD_SIZE - 1].score
}

// Plausibility ceiling: the most points a game could possibly have scored
// by the end of `wave`, as an upper bound built from the game's real point
// values (never a guess at what's typical). For every wave w up to `wave`:
//
//   kills: every meteor in the wave (at the widest screen's count, which
//     has the most), each assumed to split into splitFragments pieces that
//     are all destroyed; plus the most UFOs (2 from ufoSecondPassWave, 1
//     from ufoStartWave) and scouts (scoutCountMax from scoutStartWave)
//     that can appear.
//   points per kill: base points x waveMultiplier(w) x chainMultiplierCap
//     (every kill scored at the highest chain multiplier).
//   wave bonus: waveBonus() with every outlined building standing and
//     every launcher's ammo unused.
//
// It's deliberately loose (no real game scores every kill at the chain
// cap), so it only rejects scores no game could reach. It tracks tuning.ts
// automatically, so changing point values or counts can't make honest
// scores fail.
export function scoreCeiling(wave: number): number {
  let total = 0
  for (let w = 1; w <= wave; w++) {
    const config = waveConfig(w, TUNING.widePressureFullWidth)
    const meteorKills = config.meteorCount * Math.max(1, TUNING.splitFragments)
    const ufos = w >= TUNING.ufoSecondPassWave ? 2 : w >= TUNING.ufoStartWave ? 1 : 0
    const scouts = w >= TUNING.scoutStartWave ? TUNING.scoutCountMax : 0
    const perKillScale = waveMultiplier(w) * TUNING.chainMultiplierCap
    const killPoints =
      perKillScale *
      (meteorKills * TUNING.meteorPoints + ufos * TUNING.ufoPoints + scouts * TUNING.scoutPoints)
    const ammo = TUNING.ammoPerLauncher * launcherFractions.length
    total += killPoints + waveBonus(REGIONS.length, ammo, w).total
  }
  return total
}

// Sanity bounds on the wave reached, well past anything playable (speed and
// spawn rate stop increasing long before this), and on the score so it
// always fits the database's INTEGER column.
export const MAX_WAVE = 500
export const MAX_SCORE = 2_000_000_000
