import { useMemo, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'
import type { Book } from '../../types/book'
import type { BooksStatus } from '../../hooks/useBooks'
import { searchBooks, sortBooks, type BookSortKey } from './bookFilters'
import { BookCard } from './BookCard'
import { BookCardSkeleton } from './BookCardSkeleton'
import { BookLibraryPagination } from './BookLibraryPagination'
import { headingClass } from '../games/shared'

const SORT_OPTIONS: { key: BookSortKey; label: string }[] = [
  { key: 'dateRead', label: 'Date Read' },
  { key: 'title', label: 'Title' },
  { key: 'author', label: 'Author' },
  { key: 'rating', label: 'Rating' },
]

type Props = {
  books: Book[]
  status: BooksStatus
}

export function BookLibrary({ books, status }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<BookSortKey>('dateRead')
  const [pageSize, setPageSize] = useState(12)
  const [currentPage, setCurrentPage] = useState(1)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filtered = useMemo(() => sortBooks(searchBooks(books, search), sortKey), [books, search, sortKey])

  // Reset to page 1 whenever the result set or page size changes, so a stale
  // page number never silently shows unrelated results. Adjusted during
  // render (React's documented pattern for this) rather than in an effect,
  // which would cost an extra render pass.
  const filterSignature = `${search}|${sortKey}|${pageSize}|${books.length}`
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature)
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature)
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)

  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  )

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 ref={headingRef} className={`${headingClass} scroll-mt-24`}>
        Library
      </h2>
      <p className="mt-2 text-slate-300">Everything read so far.</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSortKey(option.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                sortKey === option.key
                  ? 'border-[var(--laser-cyan)] text-[var(--laser-cyan)]'
                  : 'border-white/10 text-slate-400 hover:text-slate-200'
              }`}
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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or author..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {status === 'loading' ? (
          Array.from({ length: pageSize }, (_, index) => <BookCardSkeleton key={index} />)
        ) : status === 'error' ? (
          <p className="col-span-full text-center text-slate-400">
            Unable to load your library right now. Please try again later.
          </p>
        ) : paginated.length === 0 ? (
          <p className="col-span-full text-center text-slate-400">No books match your search.</p>
        ) : (
          paginated.map((book) => <BookCard key={book.hardcoverBookId} book={book} />)
        )}
      </div>

      {status === 'live' && filtered.length > 0 && (
        <BookLibraryPagination
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  )
}
