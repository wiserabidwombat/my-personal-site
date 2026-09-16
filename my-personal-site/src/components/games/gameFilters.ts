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

// The Random Game Picker uses single-select category/mechanic and a single
// player-count value instead of the inventory page's multi-select +
// min/max-player filters: with ~150 games, ANDing several multi-select
// categories/mechanics together (filterBoardGames above) frequently zeroes
// out the eligible set, which is fine for browsing but bad for "pick me
// something now." Kept as a separate type/function (rather than widening
// GameFilters) so the two filtering behaviors can't drift into each other.
export type PickerFilters = {
  category: string | null
  mechanic: string | null
  players: number | null
  minPlaytime: number | null
  maxPlaytime: number | null
}

export const emptyPickerFilters: PickerFilters = {
  category: null,
  mechanic: null,
  players: null,
  minPlaytime: null,
  maxPlaytime: null,
}

export function filterBoardGamesForPicker(games: BoardGame[], filters: PickerFilters): BoardGame[] {
  return games.filter((game) => {
    const categories = game.categories ?? []
    const mechanics = game.mechanics ?? []
    const matchesCategory = filters.category === null || categories.includes(filters.category)
    const matchesMechanic = filters.mechanic === null || mechanics.includes(filters.mechanic)
    // Containment, not an exact match: eligible whenever the entered player
    // count falls anywhere within the game's own min-max player range.
    const matchesPlayers =
      filters.players === null ||
      (game.playersMin != null &&
        game.playersMax != null &&
        game.playersMin <= filters.players &&
        filters.players <= game.playersMax)
    const matchesMinPlaytime =
      filters.minPlaytime === null ||
      (game.minPlaytime != null && game.minPlaytime >= filters.minPlaytime)
    const matchesMaxPlaytime =
      filters.maxPlaytime === null ||
      (game.maxPlaytime != null && game.maxPlaytime <= filters.maxPlaytime)
    return matchesCategory && matchesMechanic && matchesPlayers && matchesMinPlaytime && matchesMaxPlaytime
  })
}
