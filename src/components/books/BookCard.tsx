import type { Book } from '../../types/book'
import { formatDateRead } from './bookFilters'
import { BookCover } from './BookCover'
import { BookLink } from './BookLink'

type Props = {
  book: Book
}

// Library card: 2:3 cover, then title (two lines max, full title on hover),
// authors, and date read. Rating and rereads appear only when there are any.
export function BookCard({ book }: Props) {
  const dateRead = formatDateRead(book.dateRead)

  return (
    <BookLink href={book.hardcoverUrl} className="flex-col">
      <BookCover url={book.coverImageUrl} title={book.title} />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 title={book.title} className="line-clamp-2 text-sm leading-snug font-semibold text-slate-100">
          {book.title}
        </h3>
        {book.author && <p className="line-clamp-1 text-xs text-slate-400">{book.author}</p>}
        <div className="mt-auto flex flex-wrap gap-x-2 gap-y-0.5 pt-1 text-xs text-slate-400">
          {dateRead && <span>{dateRead}</span>}
          {book.rating != null && (
            <span className="text-[var(--laser-cyan)]">
              {book.rating.toFixed(1)}
              <span className="sr-only"> out of 5</span>
              <span aria-hidden="true">/5</span>
            </span>
          )}
          {book.rereadCount > 0 && <span>Reread {book.rereadCount}×</span>}
        </div>
      </div>
    </BookLink>
  )
}
