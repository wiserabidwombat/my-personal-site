import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { BoardGamesSource } from '../../hooks/useBoardGames'
import type { BoardGame } from '../../types/board-game'
import { uniqueSorted } from './shared'
import { filterInventory, sortInventory, type InventorySearch } from './inventoryFilters'
import { LibraryIcon } from '@hugeicons/core-free-icons'
import { BggAttribution, SourceIndicator } from './InventoryMeta'
import { GameSection } from './GameSection'
import { InventoryToolbar } from './InventoryToolbar'
import { InventoryPagination } from './InventoryPagination'
import { InventoryEmptyState } from './InventoryEmptyState'
import { GameCard } from './GameCard'
import { GameCardSkeleton } from './GameCardSkeleton'
import { RandomGamePicker } from './RandomGamePicker'

const PAGE_SIZE_OPTIONS = [12, 24, 48] as const
// Two full rows of the 4-column desktop grid -- roughly what shows above the
// fold -- rather than a sparse handful of skeletons.
const SKELETON_CARD_COUNT = 8

type Props = {
  games: BoardGame[]
  source: BoardGamesSource
}

export function GameInventory({ games: boardGames, source }: Props) {
  // Filters, search, and sort are URL search params (see routes/games.tsx),
  // so any filtered view can be shared. replace: true keeps typing and chip
  // toggling from flooding the browser history. Typed explicitly: the route
  // file imports this component, so inference through useSearch is circular.
  const search: InventorySearch = useSearch({ from: '/games' })
  const navigate = useNavigate({ from: '/games' })
  const update = (patch: Partial<InventorySearch>) =>
    void navigate({ search: (prev: InventorySearch) => ({ ...prev, ...patch }), replace: true })
  const clearFilters = () => void navigate({ search: (prev: InventorySearch) => ({ sort: prev.sort }), replace: true })

  const allCategories = useMemo(() => uniqueSorted(boardGames.map((game) => game.categories ?? [])), [boardGames])
  const allMechanics = useMemo(() => uniqueSorted(boardGames.map((game) => game.mechanics ?? [])), [boardGames])
  const results = useMemo(
    () => sortInventory(filterInventory(boardGames, search), search.sort),
    [boardGames, search],
  )

  const [pageSize, setPageSize] = useState<number>(24)
  const [currentPage, setCurrentPage] = useState(1)
  // Back to page 1 whenever the filters, sort, or page size change, so a
  // stale page number never shows unrelated results. Adjusted during render
  // (React's documented pattern) rather than in an effect.
  const resetSignature = JSON.stringify([search, pageSize])
  const [prevResetSignature, setPrevResetSignature] = useState(resetSignature)
  if (resetSignature !== prevResetSignature) {
    setPrevResetSignature(resetSignature)
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(results.length / pageSize))
  const page = Math.min(currentPage, totalPages)
  const firstIndex = (page - 1) * pageSize
  const paginated = results.slice(firstIndex, firstIndex + pageSize)

  return (
    <GameSection
      icon={LibraryIcon}
      title="Game Inventory"
      description="Everything currently on the shelf."
      aside={<SourceIndicator source={source} />}
    >
      <BggAttribution />

      <InventoryToolbar
        search={search}
        update={update}
        clearFilters={clearFilters}
        allCategories={allCategories}
        allMechanics={allMechanics}
        picker={<RandomGamePicker games={results} />}
      />

      {source !== 'loading' && results.length > 0 && (
        <p className="mt-6 text-sm text-slate-400" aria-live="polite">
          Showing {firstIndex + 1}–{firstIndex + paginated.length} of {results.length} games
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {source === 'loading' ? (
          Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => <GameCardSkeleton key={i} />)
        ) : results.length === 0 ? (
          <InventoryEmptyState onClear={clearFilters} />
        ) : (
          paginated.map((game) => (
            <GameCard key={game.id} game={game} />
          ))
        )}
      </div>

      {results.length > 0 && (
        <InventoryPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={setPageSize}
        />
      )}
    </GameSection>
  )
}
