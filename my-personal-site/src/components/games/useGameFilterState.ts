import { useMemo, useState } from 'react'
import type { BoardGame } from '../../types/board-game'
import { uniqueSorted } from './shared'
import { filterBoardGames } from './gameFilters'

// Categories/Mechanics/players/playtime filtering shared by the main
// inventory page and the random game picker, so both stay in sync and each
// keeps its own independent filter state (separate hook calls, separate
// useState internals).
export function useGameFilterState(games: BoardGame[]) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedMechanics, setSelectedMechanics] = useState<string[]>([])
  const [minPlayers, setMinPlayers] = useState<number | null>(null)
  const [maxPlayers, setMaxPlayers] = useState<number | null>(null)
  const [minPlaytime, setMinPlaytime] = useState<number | null>(null)
  const [maxPlaytime, setMaxPlaytime] = useState<number | null>(null)

  const allCategories = useMemo(() => uniqueSorted(games.map((game) => game.categories ?? [])), [games])
  const allMechanics = useMemo(() => uniqueSorted(games.map((game) => game.mechanics ?? [])), [games])

  const filteredGames = useMemo(
    () =>
      filterBoardGames(games, {
        categories: selectedCategories,
        mechanics: selectedMechanics,
        minPlayers,
        maxPlayers,
        minPlaytime,
        maxPlaytime,
      }),
    [games, selectedCategories, selectedMechanics, minPlayers, maxPlayers, minPlaytime, maxPlaytime]
  )

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedMechanics.length > 0 ||
    minPlayers !== null ||
    maxPlayers !== null ||
    minPlaytime !== null ||
    maxPlaytime !== null

  function clearAllFilters() {
    setSelectedCategories([])
    setSelectedMechanics([])
    setMinPlayers(null)
    setMaxPlayers(null)
    setMinPlaytime(null)
    setMaxPlaytime(null)
  }

  return {
    allCategories,
    allMechanics,
    selectedCategories,
    setSelectedCategories,
    selectedMechanics,
    setSelectedMechanics,
    minPlayers,
    setMinPlayers,
    maxPlayers,
    setMaxPlayers,
    minPlaytime,
    setMinPlaytime,
    maxPlaytime,
    setMaxPlaytime,
    filteredGames,
    hasActiveFilters,
    clearAllFilters,
  }
}
