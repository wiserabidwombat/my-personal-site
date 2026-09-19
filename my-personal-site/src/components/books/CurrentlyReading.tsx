import { useEffect, useState } from 'react'
import type { CurrentlyReadingBook } from '../../types/book'
import { getResizedImageUrl } from '../../lib/image'
import { headingClass } from '../games/shared'

type Status = 'loading' | 'live' | 'error'

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

  if (status === 'loading') return null

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Currently Reading</h2>
      {status === 'error' && (
        <p className="mt-2 text-center text-sm text-slate-400">
          Unable to load what you're reading right now. Please try again later.
        </p>
      )}
      {status === 'live' && (
        books.length === 0 ? (
          <p className="mt-2 text-slate-300">Not reading anything right now.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div
                key={book.hardcoverBookId}
                className="flex gap-4 overflow-hidden rounded-2xl border-2 border-[var(--laser-cyan)] bg-[var(--deep-space-purple)]/40 p-4 shadow-glow-cyan backdrop-blur-md"
              >
                {book.coverImageUrl && (
                  <img
                    src={getResizedImageUrl(book.coverImageUrl, 'large')}
                    alt={`Cover of ${book.title}`}
                    loading="lazy"
                    className="h-24 w-16 flex-none rounded-md object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-slate-100">{book.title}</p>
                  <p className="text-sm text-slate-400">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  )
}
