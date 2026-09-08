import { useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Input } from '../../../@/components/ui/input'
import { Badge } from '../../../@/components/ui/badge'
import { Button } from '../../../@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../@/components/ui/table'
import type { Specimen } from '../../types/specimen'
import { headingClass } from '../games/shared'

type Filter = 'All' | 'Minerals' | 'Fossils'

const filters: Filter[] = ['All', 'Minerals', 'Fossils']
const PAGE_SIZE = 10

type Props = {
  specimens: Specimen[]
  loading: boolean
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function CatalogLedger({ specimens, loading }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return specimens.filter((specimen) => {
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Minerals' && specimen.type === 'mineral') ||
        (filter === 'Fossils' && specimen.type === 'fossil')
      const matchesSearch =
        query === '' ||
        specimen.name.toLowerCase().includes(query) ||
        (specimen.locationFound ?? '').toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  }, [specimens, search, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilter(next: Filter) {
    setFilter(next)
    setPage(1)
  }

  function updateSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className={headingClass}>Catalog Ledger</h2>
      <p className="mt-2 text-slate-300">The full collection, searchable and paginated.</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {filters.map((item) => (
            <Badge
              key={item}
              variant={filter === item ? 'secondary' : 'outline'}
              onClick={() => updateFilter(item)}
              className="cursor-pointer select-none"
            >
              {item}
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
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search name or location..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/40">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--cyber-purple)]/40 hover:bg-transparent">
              <TableHead className="text-[var(--laser-cyan)]">Name</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Type</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Found</TableHead>
              <TableHead className="text-[var(--laser-cyan)]">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="border-[var(--cyber-purple)]/20">
                  <TableCell colSpan={4}>
                    <div className="h-4 w-full animate-pulse rounded bg-[var(--deep-space-purple)]/50" />
                  </TableCell>
                </TableRow>
              ))}

            {!loading &&
              pageItems.map((specimen) => (
                <TableRow key={specimen.id} className="border-[var(--cyber-purple)]/20">
                  <TableCell className="font-medium text-slate-100">{specimen.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {specimen.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {formatDate(specimen.dateCollected)}
                  </TableCell>
                  <TableCell className="text-slate-300">{specimen.locationFound ?? '—'}</TableCell>
                </TableRow>
              ))}

            {!loading && pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-400">
                  No specimens match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && filtered.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-[var(--laser-cyan)]/40 text-[var(--laser-cyan)] hover:bg-[var(--laser-cyan)]/10"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="border-[var(--laser-cyan)]/40 text-[var(--laser-cyan)] hover:bg-[var(--laser-cyan)]/10"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
