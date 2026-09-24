import { useMemo, useState } from 'react'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { LibraryIcon, Search01Icon } from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'
import type { Book } from '../../types/book'
import type { BooksStatus } from '../../hooks/useBooks'
import { SectionHeading } from '../SectionHeading'
import { neonOutlineButton, outlinePill, outlinePillActive, pageContainer } from '../../lib/styles'
import { searchBooks, sortBooks, type BookSortKey } from './bookFilters'
import { BookCard } from './BookCard'
import { BookCardSkeleton } from './BookCardSkeleton'
import { HardcoverCredit } from './HardcoverCredit'

const SORT_OPTIONS: { key: BookSortKey; label: string }[] = [
  { key: 'dateRead', label: 'Date Read' },
  { key: 'title', label: 'Title' },
  { key: 'author', label: 'Author' },
  { key: 'rating', label: 'Rating' },
]

// Four full rows of the 6-column desktop grid per batch.
const BATCH_SIZE = 24

const chipClass = cn(
  outlinePill,
  'cursor-pointer hover:bg-[var(--laser-cyan)]/10 focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-space-black)] focus-visible:outline-none',
)

type Props = {
  books: Book[]
  status: BooksStatus
}

// Sort and search are plain component state (not URL params), so they never
// navigate and can't trigger the router's scroll-to-top.
export function BookLibrary({ books, status }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<BookSortKey>('dateRead')
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)

  const filtered = useMemo(() => sortBooks(searchBooks(books, search), sortKey), [books, search, sortKey])
  // "Load more" appends the next batch; a new sort or search starts over.
  const visible = filtered.slice(0, visibleCount)

  function updateSort(next: BookSortKey) {
    setSortKey(next)
    setVisibleCount(BATCH_SIZE)
  }
  function updateSearch(value: string) {
    setSearch(value)
    setVisibleCount(BATCH_SIZE)
  }

  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <SectionHeading icon={LibraryIcon}>Library</SectionHeading>
      <p className="mt-2 text-slate-300">Everything read so far.</p>
      <HardcoverCredit />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Sort by" className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={sortKey === option.key}
              onClick={() => updateSort(option.key)}
              className={cn(chipClass, sortKey === option.key && outlinePillActive)}
            >
              {option.label}
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
            placeholder="Search title or author..."
            aria-label="Search books"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
        {status === 'loading' ? (
          Array.from({ length: 12 }, (_, index) => <BookCardSkeleton key={index} />)
        ) : status === 'error' ? (
          <p className="col-span-full text-slate-400">Unable to load the library right now. Please try again later.</p>
        ) : filtered.length === 0 ? (
          <p className="col-span-full text-slate-400">No books match your search.</p>
        ) : (
          visible.map((book) => <BookCard key={book.hardcoverBookId} book={book} />)
        )}
      </div>

      {status === 'live' && filtered.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm text-slate-400" aria-live="polite">
            Showing {visible.length} of {filtered.length}
          </p>
          {visible.length < filtered.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + BATCH_SIZE)}
              className={neonOutlineButton}
            >
              Load more
            </button>
          )}
        </div>
      )}
    </section>
  )
}
