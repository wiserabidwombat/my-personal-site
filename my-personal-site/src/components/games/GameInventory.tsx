import { useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, DiceFaces01Icon, ComputerIcon, Cancel01Icon } from '@hugeicons/core-free-icons'
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
import { pcGames } from '../../data/pc-games'
import { headingClass } from './shared'
import { MultiSelectFilter } from './MultiSelectFilter'
import { GameCard } from './GameCard'

type Category = 'All' | 'Board Game' | 'PC Game'

type InventoryRow = {
  id: string
  name: string
  category: Exclude<Category, 'All'>
  players: string
  rating: string
  status: string
  bggLink: string | null
  categories: string[]
  mechanics: string[]
}

const PAGE_SIZE_OPTIONS = [5, 10, 25]

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
}

function uniqueSorted(values: string[][]) {
  return [...new Set(values.flat())].sort((a, b) => a.localeCompare(b))
}

function formatPlayers(min: number | null, max: number | null) {
  if (!min && !max) return '—'
  if (min && max && min !== max) return `${min}–${max}`
  return `${min ?? max}`
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

const categoryFilters: Category[] = ['All', 'Board Game', 'PC Game']

const sourceLabel: Record<ReturnType<typeof useBoardGames>['source'], string> = {
  loading: 'Loading inventory...',
  live: 'Live from Notion',
  cached: 'Showing cached data',
}

export function GameInventory() {
  const { games: boardGames, source } = useBoardGames()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('All')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedMechanics, setSelectedMechanics] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const inventory: InventoryRow[] = useMemo(
    () => [
      ...boardGames.map((game) => ({
        id: game.id,
        name: game.name,
        category: 'Board Game' as const,
        players: formatPlayers(game.playersMin, game.playersMax),
        rating: game.rating != null ? `${game.rating}/10` : '—',
        status: game.status ?? '—',
        bggLink: game.bggLink,
        categories: game.categories ?? [],
        mechanics: game.mechanics ?? [],
      })),
      ...pcGames.map((game) => ({
        id: game.id,
        name: game.name,
        category: 'PC Game' as const,
        players: '—',
        rating: game.rating != null ? `${game.rating}/10` : '—',
        status: game.status ?? '—',
        bggLink: null,
        categories: [],
        mechanics: [],
      })),
    ],
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
      const matchesCategory = category === 'All' || game.category === category
      const matchesSearch = query === '' || game.name.toLowerCase().includes(query)
      const matchesCategories = selectedCategories.every((c) => game.categories.includes(c))
      const matchesMechanics = selectedMechanics.every((m) => game.mechanics.includes(m))
      return matchesCategory && matchesSearch && matchesCategories && matchesMechanics
    })
  }, [inventory, search, category, selectedCategories, selectedMechanics])

  const hasActiveTagFilters = selectedCategories.length > 0 || selectedMechanics.length > 0

  function clearTagFilters() {
    setSelectedCategories([])
    setSelectedMechanics([])
  }

  // Reset to page 1 whenever the result set or page size changes, so a stale
  // page number never silently shows unrelated results. Adjusted during
  // render (React's documented pattern for this) rather than in an effect,
  // which would cost an extra render pass.
  const filterSignature = JSON.stringify([search, category, selectedCategories, selectedMechanics, pageSize])
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
      <p className="mt-2 text-slate-300">Everything currently on the shelf (and the hard drive).</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {categoryFilters.map((filter) => (
            <Badge
              key={filter}
              variant={category === filter ? 'secondary' : 'outline'}
              onClick={() => setCategory(filter)}
              className="cursor-pointer gap-1 select-none"
            >
              {filter === 'Board Game' && (
                <HugeiconsIcon icon={DiceFaces01Icon} strokeWidth={2} className="size-3" aria-hidden="true" />
              )}
              {filter === 'PC Game' && (
                <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} className="size-3" aria-hidden="true" />
              )}
              {filter}
            </Badge>
          ))}
        </div>

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
          {hasActiveTagFilters && (
            <button
              type="button"
              onClick={clearTagFilters}
              className="text-xs font-medium text-[var(--laser-cyan)] underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {hasActiveTagFilters && (
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
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((game) => (
          <GameCard
            key={game.id}
            name={game.name}
            category={game.category}
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
