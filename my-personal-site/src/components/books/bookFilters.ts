import type { Book } from '../../types/book'

export type BookSortKey = 'title' | 'author' | 'rating' | 'dateRead'

export function searchBooks(books: Book[], query: string): Book[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return books
  return books.filter(
    (book) => book.title.toLowerCase().includes(normalized) || book.author.toLowerCase().includes(normalized),
  )
}

export function sortBooks(books: Book[], key: BookSortKey): Book[] {
  const sorted = [...books]
  switch (key) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'author':
      return sorted.sort((a, b) => a.author.localeCompare(b.author))
    case 'rating':
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
    case 'dateRead':
      return sorted.sort((a, b) => (b.dateRead ?? '').localeCompare(a.dateRead ?? ''))
  }
}

export function formatDateRead(dateRead: string | null): string {
  if (!dateRead) return '—'
  // Construct the Date from local y/m/d components directly rather than
  // `new Date(dateRead)`, which parses 'YYYY-MM-DD' as UTC midnight and then
  // renders one day early in any negative-UTC-offset timezone (all of the US).
  const [year, month, day] = dateRead.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
