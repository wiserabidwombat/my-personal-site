import type { Book } from '../../types/book'

export type BookStats = {
  totalRead: number
  readThisYear: number
  averageRating: number | null
  mostReadAuthor: string | null
}

export function computeBookStats(books: Book[], now: Date = new Date()): BookStats {
  const currentYear = now.getFullYear()
  const totalRead = books.length
  const readThisYear = books.filter((book) => {
    if (book.dateRead == null) return false
    const dateYear = parseInt(book.dateRead.substring(0, 4), 10)
    return dateYear === currentYear
  }).length

  const ratedBooks = books.filter((book) => book.rating != null)
  const averageRating =
    ratedBooks.length === 0
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

  return { totalRead, readThisYear, averageRating, mostReadAuthor }
}
