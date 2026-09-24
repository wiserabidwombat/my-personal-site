import { useEffect, useState } from 'react'
import { cn } from 'cn'
import { BookOpen01Icon } from '@hugeicons/core-free-icons'
import type { CurrentlyReadingBook } from '../../types/book'
import { SectionHeading } from '../SectionHeading'
import { pageContainer } from '../../lib/styles'
import { splitTitle } from './bookFilters'
import { BookCover } from './BookCover'
import { BookLink } from './BookLink'
import { CurrentlyReadingSkeleton } from './CurrentlyReadingSkeleton'

type Status = 'loading' | 'live' | 'error'

// A currently-reading shelf is realistically 1-3 books; two skeleton slots
// fill one row of the sm:grid-cols-2 grid below without overcommitting to a
// shelf size that isn't known yet.
const SKELETON_COUNT = 2

function ReadingProgress({ percent }: { percent: number }) {
  return (
    <div className="mt-auto pt-3">
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
        className="h-1 overflow-hidden rounded-full bg-white/10"
      >
        <div className="h-full rounded-full bg-[var(--laser-cyan)]" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-400">{percent}% read</p>
    </div>
  )
}

function CurrentlyReadingCard({ book }: { book: CurrentlyReadingBook }) {
  const { main, sub } = splitTitle(book.title, book.subtitle)

  return (
    <BookLink href={book.hardcoverUrl} className="gap-4 p-3">
      <BookCover url={book.coverImageUrl} title={book.title} className="w-24 flex-none self-start rounded-lg sm:w-28" />
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <h3 className="text-base leading-snug font-semibold text-slate-100">{main}</h3>
        {sub && <p className="mt-0.5 text-sm leading-snug text-slate-300">{sub}</p>}
        {book.author && <p className="mt-1.5 text-xs text-slate-400">{book.author}</p>}
        {book.progressPercent != null && <ReadingProgress percent={book.progressPercent} />}
      </div>
    </BookLink>
  )
}

export function CurrentlyReading() {
  const [books, setBooks] = useState<CurrentlyReadingBook[]>([])
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let cancelled = false

    fetch('/api/currently-reading')
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return response.json() as Promise<{ books: CurrentlyReadingBook[] }>
      })
      .then((data) => {
        if (!cancelled) {
          setBooks(data.books)
          setStatus('live')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <SectionHeading icon={BookOpen01Icon}>Currently Reading</SectionHeading>
      {status === 'loading' && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <CurrentlyReadingSkeleton key={index} />
          ))}
        </div>
      )}
      {status === 'error' && (
        <p className="mt-2 text-sm text-slate-400">
          Unable to load what I'm reading right now. Please try again later.
        </p>
      )}
      {status === 'live' &&
        (books.length === 0 ? (
          <p className="mt-2 text-slate-300">Not reading anything right now.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {books.map((book) => (
              <CurrentlyReadingCard key={book.hardcoverBookId} book={book} />
            ))}
          </div>
        ))}
    </section>
  )
}
