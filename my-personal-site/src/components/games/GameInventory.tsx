import { useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, DiceFaces01Icon, ComputerIcon } from '@hugeicons/core-free-icons'
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
import boardGamesData from '../../data/board-games.json'
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
}

function formatPlayers(min: number | null, max: number | null) {
  if (!min && !max) return '—'
  if (min && max && min !== max) return `${min}–${max}`
  return `${min ?? max}`
}

const inventory: InventoryRow[] = [
  ...boardGamesData.map((game) => ({
    id: game.id,
    name: game.name,
    category: 'Board Game' as const,
    players: formatPlayers(game.playersMin, game.playersMax),
    rating: game.rating != null ? `${game.rating}/10` : '—',
    status: game.status ?? '—',
  })),
  ...pcGames.map((game) => ({
    id: game.id,
    name: game.name,
    category: 'PC Game' as const,
    players: '—',
    rating: game.rating != null ? `${game.rating}/10` : '—',
    status: game.status ?? '—',
  })),
]

const categoryFilters: Category[] = ['All', 'Board Game', 'PC Game']

export function GameInventory() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('All')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return inventory.filter((game) => {
      const matchesCategory = category === 'All' || game.category === category
      const matchesSearch = query === '' || game.name.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [search, category])

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Game Inventory</h2>
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

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/40">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--cyber-purple)]/40 hover:bg-transparent">
              <TableHead className="text-[var(--laser-cyan)]">Game</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Category</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Players</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Rating</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Status</TableHead>
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
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400">
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
