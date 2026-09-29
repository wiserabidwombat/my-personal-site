import { qualifies } from './scoreboard'

// Dev-only test runs: /skyline-defense?wave=N starts the game at wave N
// (to reach boss waves without playing up to them). Only read when
// import.meta.env.DEV is true; production builds drop it. A test run never
// submits to the leaderboard or updates the local personal best.

// Past this, nothing changes: speed, spawn rate and the boss's stats have
// all hit their caps.
export const TEST_WAVE_MAX = 30

// The starting wave from a URL's query string, or null when not in dev, the
// param is missing, or it isn't a positive integer (clamped to
// TEST_WAVE_MAX).
export function testWaveFromUrl(search: string): number | null {
  if (!import.meta.env.DEV) return null
  const raw = new URLSearchParams(search).get('wave')
  if (raw === null || !/^[1-9]\d*$/.test(raw)) return null
  return Math.min(Number(raw), TEST_WAVE_MAX)
}

// The personal best after a game: a real run beats it or not; a test run
// (testWave set) never changes it or saves it.
export function personalBestAfter(score: number, best: number, testWave: number | null) {
  const beaten = testWave === null && score > best
  return { best: beaten ? score : best, newHighScore: beaten, save: beaten }
}

// Whether the game-over screen offers initials entry: only for real runs
// whose score makes the board.
export function canSubmit(testWave: number | null, score: number, board: readonly { score: number }[]): boolean {
  return testWave === null && qualifies(score, board)
}
