import { useState } from 'react'
import type { Book } from '../../types/book'
import type { BooksStatus } from '../../hooks/useBooks'
import { getResizedImageUrl } from '../../lib/image'
import { headingClass } from '../games/shared'
import { FavoriteCardSkeleton } from './FavoriteCardSkeleton'

// Shown when a book has no cover URL at all, or its cover URL 404s/fails to
// load -- see BookCard.tsx for the full rationale.
const NO_COVER_IMAGE = '/books/trex-no-cover.jpg'

// Fills one full row of the lg:grid-cols-4 layout below without
// overcommitting to a favorites-list size that isn't known yet.
const SKELETON_COUNT = 4

function FavoriteCard({ book }: { book: Book }) {
  const [coverFailed, setCoverFailed] = useState(false)
  const coverUrl =
    !coverFailed && book.coverImageUrl ? getResizedImageUrl(book.coverImageUrl, 'large') : NO_COVER_IMAGE
  const showCover = coverUrl !== NO_COVER_IMAGE

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--neon-pink)] bg-[var(--deep-space-purple)]/40 shadow-glow-pink backdrop-blur-md">
      <img
        src={coverUrl}
        alt={showCover ? `Cover of ${book.title}` : `No cover available for ${book.title}`}
        loading="lazy"
        onError={() => setCoverFailed(true)}
        className="aspect-[2/3] w-full object-cover"
      />
      <div className="p-4">
        <p className="font-semibold text-slate-100">{book.title}</p>
        <p className="text-sm text-slate-400">{book.author}</p>
      </div>
    </div>
  )
}

type Props = {
  books: Book[]
  status: BooksStatus
}

export function FavoritesShowcase({ books, status }: Props) {
  const favorites = books.filter((book) => book.isFavorite)

  // Once loaded, a library with no favorites hides this section entirely
  // (a deliberate choice, not an oversight) -- but while still loading we
  // don't yet know whether that's the case, so a loading state still shows
  // skeleton cards rather than nothing.
  if (status !== 'loading' && favorites.length === 0) return null

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Favorites</h2>
      <p className="mt-2 text-slate-300">Books starred on Hardcover.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {status === 'loading'
          ? Array.from({ length: SKELETON_COUNT }, (_, index) => <FavoriteCardSkeleton key={index} />)
          : favorites.map((book) => <FavoriteCard key={book.hardcoverBookId} book={book} />)}
      </div>
    </section>
  )
}
