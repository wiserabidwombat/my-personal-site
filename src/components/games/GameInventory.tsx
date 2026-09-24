import { useMemo, useRef, useState } from 'react'
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
  // so any filtered view can be shared. Every such navigation passes:
  // - resetScroll: false -- TanStack Router scrolls to the top on every
  //   navigate() by default, which yanked the filters out of view on each
  //   chip click, sort change, or search;
  // - replace: true -- so Back leaves the page instead of undoing filters
  //   one at a time.
  // Typed explicitly: the route file imports this component, so inference
  // through useSearch is circular.
  const search: InventorySearch = useSearch({ from: '/games' })
  const navigate = useNavigate({ from: '/games' })
  const update = (patch: Partial<InventorySearch>) =>
    void navigate({ search: (prev: InventorySearch) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
  const clearFilters = () =>
    void navigate({ search: (prev: InventorySearch) => ({ sort: prev.sort }), replace: true, resetScroll: false })

  // "Everything currently on the shelf": owned games only. Unowned rows
  // (e.g. a Want to Play entry) still feed the top sections via Games.tsx.
  const shelf = useMemo(() => boardGames.filter((game) => game.owned), [boardGames])
  const allCategories = useMemo(() => uniqueSorted(shelf.map((game) => game.categories ?? [])), [shelf])
  const allMechanics = useMemo(() => uniqueSorted(shelf.map((game) => game.mechanics ?? [])), [shelf])
  const results = useMemo(() => sortInventory(filterInventory(shelf, search), search.sort), [shelf, search])

  const [pageSize, setPageSize] = useState<number>(24)
  const [currentPage, setCurrentPage] = useState(1)
  // Back to page 1 whenever the filters, sort, or page size change, so a
  // stale page number never shows unrelated results. Adjusted during render
  // (React's documented pattern) rather than in an effect -- and it never
  // scrolls, so a filter that shrinks the results doesn't move the page.
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

  // Paging (local state, not a navigation) brings the top of the new page
  // into view: the "Showing X–Y" line lands just below the sticky header.
  // Instant instead of smooth when the visitor prefers reduced motion.
  const resultsTopRef = useRef<HTMLParagraphElement>(null)
  function goToPage(next: number) {
    setCurrentPage(next)
    const target = resultsTopRef.current
    if (!target) return
    const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' })
  }

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
        <p ref={resultsTopRef} className="mt-6 text-sm text-slate-400" aria-live="polite">
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
          onPageChange={goToPage}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={setPageSize}
        />
      )}
    </GameSection>
  )
}
