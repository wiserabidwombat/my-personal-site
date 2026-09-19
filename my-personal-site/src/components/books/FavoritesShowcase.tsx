import type { Book } from '../../types/book'
import { getResizedImageUrl } from '../../lib/image'
import { headingClass } from '../games/shared'

type Props = {
  books: Book[]
}

export function FavoritesShowcase({ books }: Props) {
  const favorites = books.filter((book) => book.isFavorite)

  if (favorites.length === 0) return null

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Favorites</h2>
      <p className="mt-2 text-slate-300">Books starred on Hardcover.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {favorites.map((book) => (
          <div
            key={book.hardcoverBookId}
            className="flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--neon-pink)] bg-[var(--deep-space-purple)]/40 shadow-glow-pink backdrop-blur-md"
          >
            {book.coverImageUrl && (
              <img
                src={getResizedImageUrl(book.coverImageUrl, 'large')}
                alt={`Cover of ${book.title}`}
                loading="lazy"
                className="aspect-[2/3] w-full object-cover"
              />
            )}
            <div className="p-4">
              <p className="font-semibold text-slate-100">{book.title}</p>
              <p className="text-sm text-slate-400">{book.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
