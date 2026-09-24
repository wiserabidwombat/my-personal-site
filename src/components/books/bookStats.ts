import type { Book } from '../../types/book'

export type BookStats = {
  totalRead: number
  readThisYear: number
  // Null until at least MIN_RATED_FOR_AVERAGE books are rated -- an
  // "average" of one or two ratings says little.
  averageRating: number | null
  ratedCount: number
  mostReadAuthor: string | null
}

export const MIN_RATED_FOR_AVERAGE = 3

export function computeBookStats(books: Book[], now: Date = new Date()): BookStats {
  const currentYear = now.getFullYear()
  const totalRead = books.length
  const readThisYear = books.filter((book) => {
    if (book.dateRead == null) return false
    // book.dateRead is always an ISO 'YYYY-MM-DD' string (Hardcover's date scalar,
    // via api/books.ts), so the year is extracted via substring rather than
    // `new Date(dateRead).getFullYear()`, which is timezone-dependent and can be
    // off by one year at year boundaries (same bug class as BookLibrary.tsx's
    // formatDateRead works around).
    const dateYear = parseInt(book.dateRead.substring(0, 4), 10)
    return dateYear === currentYear
  }).length

  const ratedBooks = books.filter((book) => book.rating != null)
  const averageRating =
    ratedBooks.length < MIN_RATED_FOR_AVERAGE
      ? null
      : ratedBooks.reduce((sum, book) => sum + (book.rating ?? 0), 0) / ratedBooks.length

  const authorCounts = new Map<string, number>()
  for (const book of books) {
    if (!book.author) continue
    authorCounts.set(book.author, (authorCounts.get(book.author) ?? 0) + 1)
  }
  let mostReadAuthor: string | null = null
  let mostReadCount = 0
  for (const [author, count] of authorCounts) {
    if (count > mostReadCount) {
      mostReadAuthor = author
      mostReadCount = count
    }
  }

  return { totalRead, readThisYear, averageRating, ratedCount: ratedBooks.length, mostReadAuthor }
}
