import { useMemo, useState } from 'react'
import type { BoardGame } from '../../types/board-game'
import { uniqueSorted } from './shared'
import { filterBoardGamesForPicker } from './gameFilters'

// Random Game Picker filter state: single-select category/mechanic and a
// single player-count value, kept independent of useGameFilterState (the
// inventory page's multi-select + min/max-player state) -- separate hook,
// separate useState internals, so the two controls never share state.
export function usePickerFilterState(games: BoardGame[]) {
  const [category, setCategory] = useState<string | null>(null)
  const [mechanic, setMechanic] = useState<string | null>(null)
  const [players, setPlayers] = useState<number | null>(null)
  const [minPlaytime, setMinPlaytime] = useState<number | null>(null)
  const [maxPlaytime, setMaxPlaytime] = useState<number | null>(null)

  const allCategories = useMemo(() => uniqueSorted(games.map((game) => game.categories ?? [])), [games])
  const allMechanics = useMemo(() => uniqueSorted(games.map((game) => game.mechanics ?? [])), [games])

  const filteredGames = useMemo(
    () => filterBoardGamesForPicker(games, { category, mechanic, players, minPlaytime, maxPlaytime }),
    [games, category, mechanic, players, minPlaytime, maxPlaytime]
  )

  const hasActiveFilters =
    category !== null || mechanic !== null || players !== null || minPlaytime !== null || maxPlaytime !== null

  function clearAllFilters() {
    setCategory(null)
    setMechanic(null)
    setPlayers(null)
    setMinPlaytime(null)
    setMaxPlaytime(null)
  }

  return {
    allCategories,
    allMechanics,
    category,
    setCategory,
    mechanic,
    setMechanic,
    players,
    setPlayers,
    minPlaytime,
    setMinPlaytime,
    maxPlaytime,
    setMaxPlaytime,
    filteredGames,
    hasActiveFilters,
    clearAllFilters,
  }
}
