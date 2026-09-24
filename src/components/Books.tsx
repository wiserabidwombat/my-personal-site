import { useBooks } from '../hooks/useBooks'
import { CurrentlyReading } from './books/CurrentlyReading'
import { FavoritesShowcase } from './books/FavoritesShowcase'
import { StatsSummary } from './books/StatsSummary'
import { BookLibrary } from './books/BookLibrary'

export function Books() {
  const { books, status } = useBooks()

  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
      <CurrentlyReading />
      <FavoritesShowcase books={books} status={status} />
      <StatsSummary books={books} status={status} />
      <BookLibrary books={books} status={status} />
    </div>
  )
}
