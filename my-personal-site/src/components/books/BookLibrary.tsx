import { useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Input } from '../../../@/components/ui/input'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../@/components/ui/table'
import type { Book } from '../../types/book'
import type { BooksStatus } from '../../hooks/useBooks'
import { searchBooks, sortBooks, type BookSortKey } from './bookFilters'
import { headingClass } from '../games/shared'

const SORT_OPTIONS: { key: BookSortKey; label: string }[] = [
  { key: 'dateRead', label: 'Date Read' },
  { key: 'title', label: 'Title' },
  { key: 'author', label: 'Author' },
  { key: 'rating', label: 'Rating' },
]

function formatDateRead(dateRead: string | null): string {
  if (!dateRead) return '—'
  // Construct the Date from local y/m/d components directly rather than
  // `new Date(dateRead)`, which parses 'YYYY-MM-DD' as UTC midnight and then
  // renders one day early in any negative-UTC-offset timezone (all of the US).
  const [year, month, day] = dateRead.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

type Props = {
  books: Book[]
  status: BooksStatus
}

export function BookLibrary({ books, status }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<BookSortKey>('dateRead')

  const rows = useMemo(() => sortBooks(searchBooks(books, search), sortKey), [books, search, sortKey])

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Library</h2>
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

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Date Read</TableHead>
              <TableHead>Re-reads</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'loading' ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400">
                  Loading your library...
                </TableCell>
              </TableRow>
            ) : status === 'error' ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400">
                  Unable to load your library right now. Please try again later.
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400">
                  No books match your search.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((book) => (
                <TableRow key={book.hardcoverBookId}>
                  <TableCell className="font-medium text-slate-100">{book.title}</TableCell>
                  <TableCell className="text-slate-300">{book.author}</TableCell>
                  <TableCell className="text-slate-300">{book.rating != null ? `${book.rating.toFixed(1)}/5` : '—'}</TableCell>
                  <TableCell className="text-slate-300">{formatDateRead(book.dateRead)}</TableCell>
                  <TableCell className="text-slate-300">{book.rereadCount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
