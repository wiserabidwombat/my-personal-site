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

// "Read Mar 2026" for the library cards, or null when no date is logged.
export function formatDateRead(dateRead: string | null): string | null {
  if (!dateRead) return null
  // Construct the Date from local y/m components directly rather than
  // `new Date(dateRead)`, which parses 'YYYY-MM-DD' as UTC midnight and then
  // renders one day early in any negative-UTC-offset timezone (all of the US)
  // -- on the 1st of a month, that's the previous month.
  const [year, month] = dateRead.split('-').map(Number)
  return `Read ${new Date(year, month - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`
}

// Splits "Title: Subtitle" into a main title and a subtitle for display.
// A title with no colon keeps Hardcover's separate subtitle, if any.
export function splitTitle(title: string, subtitle: string | null = null): { main: string; sub: string | null } {
  const index = title.indexOf(': ')
  if (index > 0) return { main: title.slice(0, index), sub: title.slice(index + 2) }
  return { main: title, sub: subtitle }
}
