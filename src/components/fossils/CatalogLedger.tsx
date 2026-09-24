import { useMemo, useState } from 'react'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { GemIcon, Search01Icon } from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'
import type { Specimen } from '../../types/specimen'
import type { SpecimensState } from '../../hooks/useSpecimens'
import { SectionHeading } from '../SectionHeading'
import { neonOutlineButton, outlinePill, outlinePillActive, pageContainer } from '../../lib/styles'
import { SpecimenCard } from './SpecimenCard'
import { SpecimenCardSkeleton } from './SpecimenCardSkeleton'
import { collectionSummary } from './specimenFormat'

type Filter = 'All' | 'Minerals' | 'Fossils'

const filters: Filter[] = ['All', 'Minerals', 'Fossils']
// Three full rows of the 4-column desktop grid per batch.
const BATCH_SIZE = 12

const statusLabel: Record<SpecimensState['status'], string> = {
  loading: 'Connecting to Neon...',
  ready: 'Live from Neon',
  error: 'Unable to reach Neon',
}

const chipClass = cn(
  outlinePill,
  'cursor-pointer hover:bg-[var(--laser-cyan)]/10 focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-space-black)] focus-visible:outline-none',
)

type Props = {
  specimens: Specimen[]
  loading: boolean
  status: SpecimensState['status']
}

// Filter and search are plain component state (not URL params), so they
// never navigate and can't trigger the router's scroll-to-top.
export function CatalogLedger({ specimens, loading, status }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)

  const summary = useMemo(() => collectionSummary(specimens), [specimens])
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

  // "Load more" appends the next batch; a new filter or search starts over.
  const visible = filtered.slice(0, visibleCount)
  function updateFilter(next: Filter) {
    setFilter(next)
    setVisibleCount(BATCH_SIZE)
  }
  function updateSearch(value: string) {
    setSearch(value)
    setVisibleCount(BATCH_SIZE)
  }

  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <SectionHeading icon={GemIcon}>Catalog Ledger</SectionHeading>
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
      <p className="mt-2 text-slate-300">The full collection, searchable.</p>
      {!loading && summary.total > 0 && (
        <p className="mt-1 text-sm text-slate-400">
          {summary.total} specimens · {summary.minerals} minerals · {summary.fossils} fossils · from{' '}
          {summary.countries} {summary.countries === 1 ? 'country' : 'countries'}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter by type" className="flex gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => updateFilter(item)}
              className={cn(chipClass, filter === item && outlinePillActive)}
            >
              {item}
            </button>
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
            type="search"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search name or location..."
            aria-label="Search specimens"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {loading && Array.from({ length: BATCH_SIZE }, (_, index) => <SpecimenCardSkeleton key={index} />)}
        {!loading && visible.map((specimen) => <SpecimenCard key={specimen.id} specimen={specimen} />)}
        {!loading && filtered.length === 0 && (
          <p className="col-span-full text-slate-400">No specimens match your search.</p>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm text-slate-400" aria-live="polite">
            Showing {visible.length} of {filtered.length}
          </p>
          {visible.length < filtered.length && (
            <button type="button" onClick={() => setVisibleCount((count) => count + BATCH_SIZE)} className={neonOutlineButton}>
              Load more
            </button>
          )}
        </div>
      )}
    </section>
  )
}
