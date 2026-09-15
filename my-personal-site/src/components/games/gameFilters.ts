import type { BoardGame } from '../../types/board-game'

export type GameFilters = {
  categories: string[]
  mechanics: string[]
  minPlayers: number | null
  maxPlayers: number | null
  minPlaytime: number | null
  maxPlaytime: number | null
}

export const emptyGameFilters: GameFilters = {
  categories: [],
  mechanics: [],
  minPlayers: null,
  maxPlayers: null,
  minPlaytime: null,
  maxPlaytime: null,
}

// Pulled out of useGameFilterState as a plain function so the AND-combination
// logic can be unit tested directly, without rendering a hook.
export function filterBoardGames(games: BoardGame[], filters: GameFilters): BoardGame[] {
  return games.filter((game) => {
    const categories = game.categories ?? []
    const mechanics = game.mechanics ?? []
    const matchesCategories = filters.categories.every((c) => categories.includes(c))
    const matchesMechanics = filters.mechanics.every((m) => mechanics.includes(m))
    const matchesMinPlayers =
      filters.minPlayers === null || (game.playersMax != null && game.playersMax >= filters.minPlayers)
    const matchesMaxPlayers =
      filters.maxPlayers === null || (game.playersMin != null && game.playersMin <= filters.maxPlayers)
    // Unlike the player-count filters above (which check for range overlap),
    // playtime compares the same field directly: Min Playtime checks the
    // game's own minPlaytime, Max Playtime checks its own maxPlaytime.
    const matchesMinPlaytime =
      filters.minPlaytime === null ||
      (game.minPlaytime != null && game.minPlaytime >= filters.minPlaytime)
    const matchesMaxPlaytime =
      filters.maxPlaytime === null ||
      (game.maxPlaytime != null && game.maxPlaytime <= filters.maxPlaytime)
    return (
      matchesCategories &&
      matchesMechanics &&
      matchesMinPlayers &&
      matchesMaxPlayers &&
      matchesMinPlaytime &&
      matchesMaxPlaytime
    )
  })
}

// Uniform random pick, recomputed fresh from the current eligible set each
// call -- never biased toward array order or a previous pick.
export function pickRandomGame(games: BoardGame[]): BoardGame | null {
  if (games.length === 0) return null
  return games[Math.floor(Math.random() * games.length)]
}
