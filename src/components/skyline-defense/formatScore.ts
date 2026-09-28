// Every score the game shows (HUD, start and game-over screens, initials
// entry, leaderboard) goes through this one formatter: grouped thousands in
// US style, e.g. 3,975, whatever the viewer's locale.
const SCORE_FORMAT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export function formatScore(value: number): string {
  return SCORE_FORMAT.format(value)
}
