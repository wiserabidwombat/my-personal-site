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
