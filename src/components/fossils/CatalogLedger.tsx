import { useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Input } from '../../../@/components/ui/input'
import { Badge } from '../../../@/components/ui/badge'
import { Button } from '../../../@/components/ui/button'
import type { Specimen } from '../../types/specimen'
import type { SpecimensState } from '../../hooks/useSpecimens'
import { headingClass } from '../games/shared'
import { SpecimenCard } from './SpecimenCard'
import { SpecimenCardSkeleton } from './SpecimenCardSkeleton'

type Filter = 'All' | 'Minerals' | 'Fossils'

const filters: Filter[] = ['All', 'Minerals', 'Fossils']
// 12 (not the board games grid's default) divides evenly into full rows at
// this grid's 3-column desktop breakpoint.
const PAGE_SIZE = 12

const statusLabel: Record<SpecimensState['status'], string> = {
  loading: 'Connecting to Neon...',
  ready: 'Live from Neon',
  error: 'Unable to reach Neon',
}

type Props = {
  specimens: Specimen[]
  loading: boolean
  status: SpecimensState['status']
}

export function CatalogLedger({ specimens, loading, status }: Props) {
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
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className={headingClass}>Catalog Ledger</h2>
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span
            className={`size-1.5 rounded-full ${
              status === 'ready'
                ? 'bg-[var(--laser-cyan)] shadow-glow-cyan'
                : status === 'loading'
                  ? 'animate-pulse bg-slate-500'
                  : 'bg-slate-500'
            }`}
          />
          {statusLabel[status]}
        </span>
      </div>
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: PAGE_SIZE }, (_, index) => <SpecimenCardSkeleton key={index} />)}

        {!loading &&
          pageItems.map((specimen) => <SpecimenCard key={specimen.id} specimen={specimen} />)}

        {!loading && pageItems.length === 0 && (
          <p className="col-span-full text-center text-slate-400">
            No specimens match your search.
          </p>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
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
