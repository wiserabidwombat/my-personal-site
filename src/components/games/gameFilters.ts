import type { BoardGame } from '../../types/board-game'

// Uniform random pick, recomputed fresh from the current eligible set each
// call -- never biased toward array order or a previous pick. The eligible
// set is the inventory's current filter results (see inventoryFilters.ts).
export function pickRandomGame(games: BoardGame[]): BoardGame | null {
  if (games.length === 0) return null
  return games[Math.floor(Math.random() * games.length)]
}
