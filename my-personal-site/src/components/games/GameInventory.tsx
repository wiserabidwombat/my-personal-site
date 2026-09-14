import { useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import { Input } from '../../../@/components/ui/input'
import { Badge } from '../../../@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../@/components/ui/pagination'
import { useBoardGames } from '../../hooks/useBoardGames'
import type { BoardGame } from '../../types/board-game'
import { headingClass, formatRange } from './shared'
import { MultiSelectFilter } from './MultiSelectFilter'
import { MinPlayersFilter } from './MinPlayersFilter'
import { MaxPlayersFilter } from './MaxPlayersFilter'
import { MinPlaytimeFilter } from './MinPlaytimeFilter'
import { MaxPlaytimeFilter } from './MaxPlaytimeFilter'
import { GameCard } from './GameCard'

type InventoryRow = {
  id: string
  name: string
  players: string
  playersMin: number | null
  playersMax: number | null
  minPlaytime: number | null
  maxPlaytime: number | null
  rating: string
  status: string
  bggLink: string | null
  categories: string[]
  mechanics: string[]
  game: BoardGame
}

const PAGE_SIZE_OPTIONS = [6, 12, 24]

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
}

function uniqueSorted(values: string[][]) {
  return [...new Set(values.flat())].sort((a, b) => a.localeCompare(b))
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | 'ellipsis')[] = [1]
  if (current > 3) pages.push('ellipsis')

  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) {
    pages.push(page)
  }

  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

const sourceLabel: Record<ReturnType<typeof useBoardGames>['source'], string> = {
  loading: 'Loading inventory...',
  live: 'Live from Notion',
  cached: 'Showing cached data',
}

export function GameInventory() {
  const { games: boardGames, source } = useBoardGames()
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedMechanics, setSelectedMechanics] = useState<string[]>([])
  const [minPlayers, setMinPlayers] = useState<number | null>(null)
  const [maxPlayers, setMaxPlayers] = useState<number | null>(null)
  const [minPlaytime, setMinPlaytime] = useState<number | null>(null)
  const [maxPlaytime, setMaxPlaytime] = useState<number | null>(null)
  const [pageSize, setPageSize] = useState(12)
  const [currentPage, setCurrentPage] = useState(1)

  const inventory: InventoryRow[] = useMemo(
    () =>
      boardGames.map((boardGame) => ({
        id: boardGame.id,
        name: boardGame.name,
        players: formatRange(boardGame.playersMin, boardGame.playersMax),
        playersMin: boardGame.playersMin,
        playersMax: boardGame.playersMax,
        minPlaytime: boardGame.minPlaytime,
        maxPlaytime: boardGame.maxPlaytime,
        rating: boardGame.rating != null ? `${boardGame.rating.toFixed(2)}/10` : '—',
        status: boardGame.status ?? '—',
        bggLink: boardGame.bggLink,
        categories: boardGame.categories ?? [],
        mechanics: boardGame.mechanics ?? [],
        game: boardGame,
      })),
    [boardGames]
  )

  const allCategories = useMemo(
    () => uniqueSorted(boardGames.map((game) => game.categories ?? [])),
    [boardGames]
  )
  const allMechanics = useMemo(
    () => uniqueSorted(boardGames.map((game) => game.mechanics ?? [])),
    [boardGames]
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return inventory.filter((game) => {
      const matchesSearch = query === '' || game.name.toLowerCase().includes(query)
      const matchesCategories = selectedCategories.every((c) => game.categories.includes(c))
      const matchesMechanics = selectedMechanics.every((m) => game.mechanics.includes(m))
      const matchesMinPlayers =
        minPlayers === null || (game.playersMax != null && game.playersMax >= minPlayers)
      const matchesMaxPlayers =
        maxPlayers === null || (game.playersMin != null && game.playersMin <= maxPlayers)
      // Unlike the player-count filters above (which check for range overlap),
      // playtime compares the same field directly: Min Playtime checks the
      // game's own minPlaytime, Max Playtime checks its own maxPlaytime.
      const matchesMinPlaytime =
        minPlaytime === null || (game.minPlaytime != null && game.minPlaytime >= minPlaytime)
      const matchesMaxPlaytime =
        maxPlaytime === null || (game.maxPlaytime != null && game.maxPlaytime <= maxPlaytime)
      return (
        matchesSearch &&
        matchesCategories &&
        matchesMechanics &&
        matchesMinPlayers &&
        matchesMaxPlayers &&
        matchesMinPlaytime &&
        matchesMaxPlaytime
      )
    })
  }, [
    inventory,
    search,
    selectedCategories,
    selectedMechanics,
    minPlayers,
    maxPlayers,
    minPlaytime,
    maxPlaytime,
  ])

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

  // Reset to page 1 whenever the result set or page size changes, so a stale
  // page number never silently shows unrelated results. Adjusted during
  // render (React's documented pattern for this) rather than in an effect,
  // which would cost an extra render pass.
  const filterSignature = JSON.stringify([
    search,
    selectedCategories,
    selectedMechanics,
    minPlayers,
    maxPlayers,
    minPlaytime,
    maxPlaytime,
    pageSize,
  ])
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature)
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature)
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pageNumbers = useMemo(() => getPageNumbers(safePage, totalPages), [safePage, totalPages])

  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  )

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className={headingClass}>Game Inventory</h2>
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span
            className={`size-1.5 rounded-full ${
              source === 'live'
                ? 'bg-[var(--laser-cyan)] shadow-glow-cyan'
                : source === 'loading'
                  ? 'animate-pulse bg-slate-500'
                  : 'bg-slate-500'
            }`}
          />
          {sourceLabel[source]}
        </span>
      </div>
      <p className="mt-2 text-slate-300">Everything currently on the shelf.</p>

      <div className="mt-6 flex justify-end">
        <div className="relative w-full sm:w-64">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search games..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {allCategories.length > 0 && (
            <MultiSelectFilter
              label="Categories"
              options={allCategories}
              selected={selectedCategories}
              onChange={setSelectedCategories}
            />
          )}
          {allMechanics.length > 0 && (
            <MultiSelectFilter
              label="Mechanics"
              options={allMechanics}
              selected={selectedMechanics}
              onChange={setSelectedMechanics}
            />
          )}
          <MinPlayersFilter value={minPlayers} onChange={setMinPlayers} />
          <MaxPlayersFilter value={maxPlayers} onChange={setMaxPlayers} />
          <MinPlaytimeFilter value={minPlaytime} onChange={setMinPlaytime} />
          <MaxPlaytimeFilter value={maxPlaytime} onChange={setMaxPlaytime} />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-medium text-[var(--laser-cyan)] underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5">
            {selectedCategories.map((tag) => (
              <Badge
                key={`cat-${tag}`}
                variant="secondary"
                onClick={() => setSelectedCategories((prev) => toggleValue(prev, tag))}
                className="cursor-pointer gap-1 text-[10px] select-none"
              >
                {tag}
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
              </Badge>
            ))}
            {selectedMechanics.map((tag) => (
              <Badge
                key={`mech-${tag}`}
                variant="secondary"
                onClick={() => setSelectedMechanics((prev) => toggleValue(prev, tag))}
                className="cursor-pointer gap-1 text-[10px] select-none"
              >
                {tag}
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
              </Badge>
            ))}
            {minPlayers !== null && (
              <Badge
                variant="secondary"
                onClick={() => setMinPlayers(null)}
                className="cursor-pointer gap-1 text-[10px] select-none"
              >
                {minPlayers}+ Players
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
              </Badge>
            )}
            {maxPlayers !== null && (
              <Badge
                variant="secondary"
                onClick={() => setMaxPlayers(null)}
                className="cursor-pointer gap-1 text-[10px] select-none"
              >
                Up to {maxPlayers} Players
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
              </Badge>
            )}
            {minPlaytime !== null && (
              <Badge
                variant="secondary"
                onClick={() => setMinPlaytime(null)}
                className="cursor-pointer gap-1 text-[10px] select-none"
              >
                {minPlaytime}+ min
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
              </Badge>
            )}
            {maxPlaytime !== null && (
              <Badge
                variant="secondary"
                onClick={() => setMaxPlaytime(null)}
                className="cursor-pointer gap-1 text-[10px] select-none"
              >
                Up to {maxPlaytime} min
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((game) => (
          <GameCard
            key={game.id}
            game={game.game}
            name={game.name}
            players={game.players}
            rating={game.rating}
            status={game.status}
            bggLink={game.bggLink}
            categories={game.categories}
            mechanics={game.mechanics}
            onCategoryTagClick={(tag) => setSelectedCategories((prev) => toggleValue(prev, tag))}
            onMechanicTagClick={(tag) => setSelectedMechanics((prev) => toggleValue(prev, tag))}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-slate-400">No games match your search.</p>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Show</span>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <Badge
              key={size}
              variant={pageSize === size ? 'secondary' : 'outline'}
              onClick={() => setPageSize(size)}
              className="cursor-pointer select-none"
            >
              {size}
            </Badge>
          ))}
          <span>per page</span>
        </div>

        {totalPages > 1 && (
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }}
                  className={safePage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {pageNumbers.map((page, index) =>
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === safePage}
                      onClick={(event) => {
                        event.preventDefault()
                        setCurrentPage(page)
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }}
                  className={safePage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </section>
  )
}
