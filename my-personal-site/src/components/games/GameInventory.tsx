import { useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  DiceFaces01Icon,
  ComputerIcon,
  ExternalLinkIcon,
} from '@hugeicons/core-free-icons'
import { Input } from '../../../@/components/ui/input'
import { Badge } from '../../../@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../@/components/ui/table'
import { useBoardGames } from '../../hooks/useBoardGames'
import { pcGames } from '../../data/pc-games'
import { headingClass } from './shared'

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

      {(allCategories.length > 0 || allMechanics.length > 0) && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[var(--cyber-purple)]/30 bg-[var(--deep-space-purple)]/20 p-4">
          {allCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Categories
              </span>
              {allCategories.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedCategories.includes(tag) ? 'secondary' : 'outline'}
                  onClick={() => setSelectedCategories((prev) => toggleValue(prev, tag))}
                  className="cursor-pointer text-[10px] select-none"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {allMechanics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Mechanics
              </span>
              {allMechanics.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedMechanics.includes(tag) ? 'secondary' : 'outline'}
                  onClick={() => setSelectedMechanics((prev) => toggleValue(prev, tag))}
                  className="cursor-pointer text-[10px] select-none"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {hasActiveTagFilters && (
            <button
              type="button"
              onClick={clearTagFilters}
              className="w-fit text-xs font-medium text-[var(--laser-cyan)] underline-offset-4 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/40">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--cyber-purple)]/40 hover:bg-transparent">
              <TableHead className="text-[var(--laser-cyan)]">Game</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Category</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Players</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Rating</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Status</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">BGG Link</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Categories</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Mechanics</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((game) => (
              <TableRow key={game.id} className="border-[var(--cyber-purple)]/20">
                <TableCell className="font-medium text-slate-100">{game.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {game.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-300">{game.players}</TableCell>
                <TableCell className="text-slate-300">{game.rating}</TableCell>
                <TableCell className="text-slate-300">{game.status}</TableCell>
                <TableCell>
                  {game.bggLink ? (
                    <a
                      href={game.bggLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${game.name} on BoardGameGeek`}
                      className="inline-flex text-slate-400 transition-colors duration-300 hover:text-[var(--laser-cyan)]"
                    >
                      <HugeiconsIcon
                        icon={ExternalLinkIcon}
                        strokeWidth={2}
                        className="size-4"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {game.categories.length > 0 ? (
                    <div className="flex max-w-48 flex-wrap gap-1">
                      {game.categories.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          onClick={() => setSelectedCategories((prev) => toggleValue(prev, tag))}
                          className="cursor-pointer text-[10px] select-none"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {game.mechanics.length > 0 ? (
                    <div className="flex max-w-48 flex-wrap gap-1">
                      {game.mechanics.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          onClick={() => setSelectedMechanics((prev) => toggleValue(prev, tag))}
                          className="cursor-pointer text-[10px] select-none"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-400">
                  No games match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
