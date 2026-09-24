import { cn } from 'cn'
import { StarIcon } from '@hugeicons/core-free-icons'
import type { Book } from '../../types/book'
import type { BooksStatus } from '../../hooks/useBooks'
import { SectionHeading } from '../SectionHeading'
import { pageContainer } from '../../lib/styles'
import { BookCover } from './BookCover'
import { BookLink } from './BookLink'
import { FavoriteCardSkeleton } from './FavoriteCardSkeleton'

// Fills one full row of the sm:grid-cols-4 layout below without
// overcommitting to a favorites-list size that isn't known yet.
const SKELETON_COUNT = 4

function FavoriteCard({ book }: { book: Book }) {
  return (
    <BookLink href={book.hardcoverUrl} className="flex-col">
      <BookCover url={book.coverImageUrl} title={book.title} />
      <div className="p-3">
        <h3 title={book.title} className="line-clamp-2 text-sm leading-snug font-semibold text-slate-100">
          {book.title}
        </h3>
        {book.author && <p className="mt-1 line-clamp-1 text-xs text-slate-400">{book.author}</p>}
      </div>
    </BookLink>
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
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <SectionHeading icon={StarIcon}>Favorites</SectionHeading>
      <p className="mt-2 text-slate-300">Books starred on Hardcover.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {status === 'loading'
          ? Array.from({ length: SKELETON_COUNT }, (_, index) => <FavoriteCardSkeleton key={index} />)
          : favorites.map((book) => <FavoriteCard key={book.hardcoverBookId} book={book} />)}
      </div>
    </section>
  )
}
