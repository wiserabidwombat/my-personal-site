import { describe, expect, it } from 'vitest'
import { searchBooks, sortBooks, formatDateRead, splitTitle } from './bookFilters'
import type { Book } from '../../types/book'

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    hardcoverBookId: 1,
    title: 'Untitled',
    author: 'Some Author',
    rating: null,
    pageCount: null,
    dateRead: null,
    coverImageUrl: null,
    hardcoverUrl: null,
    rereadCount: 0,
    isFavorite: false,
    ...overrides,
  }
}

const dune = makeBook({ hardcoverBookId: 1, title: 'Dune', author: 'Frank Herbert', rating: 5, dateRead: '2026-01-01' })
const hobbit = makeBook({ hardcoverBookId: 2, title: 'The Hobbit', author: 'J.R.R. Tolkien', rating: 4, dateRead: '2026-05-01' })
const foundation = makeBook({ hardcoverBookId: 3, title: 'Foundation', author: 'Isaac Asimov', rating: null, dateRead: null })

describe('searchBooks', () => {
  it('returns everything for an empty query', () => {
    expect(searchBooks([dune, hobbit], '')).toEqual([dune, hobbit])
  })

  it('matches on title, case-insensitively', () => {
    expect(searchBooks([dune, hobbit], 'hobbit')).toEqual([hobbit])
  })

  it('matches on author', () => {
    expect(searchBooks([dune, hobbit], 'herbert')).toEqual([dune])
  })

  it('returns an empty array when nothing matches', () => {
    expect(searchBooks([dune, hobbit], 'nonexistent')).toEqual([])
  })
})

describe('sortBooks', () => {
  it('sorts by title ascending', () => {
    expect(sortBooks([hobbit, dune, foundation], 'title').map((b) => b.title)).toEqual([
      'Dune',
      'Foundation',
      'The Hobbit',
    ])
  })

  it('sorts by author ascending', () => {
    expect(sortBooks([dune, hobbit, foundation], 'author').map((b) => b.author)).toEqual([
      'Frank Herbert',
      'Isaac Asimov',
      'J.R.R. Tolkien',
    ])
  })

  it('sorts by rating descending, with unrated books last', () => {
    expect(sortBooks([foundation, hobbit, dune], 'rating').map((b) => b.title)).toEqual([
      'Dune',
      'The Hobbit',
      'Foundation',
    ])
  })

  it('sorts by dateRead descending (most recent first), with un-dated books last', () => {
    expect(sortBooks([dune, foundation, hobbit], 'dateRead').map((b) => b.title)).toEqual([
      'The Hobbit',
      'Dune',
      'Foundation',
    ])
  })

  it('does not mutate the input array', () => {
    const input = [hobbit, dune]
    sortBooks(input, 'title')
    expect(input).toEqual([hobbit, dune])
  })
})

describe('formatDateRead', () => {
  it('returns null for a missing date', () => {
    expect(formatDateRead(null)).toBeNull()
  })

  it('formats an ISO date string as month and year', () => {
    expect(formatDateRead('2026-05-08')).toBe('Read May 2026')
  })

  // Regression test: new Date('2026-01-01') parses as UTC midnight, which
  // renders as Dec 31, 2025 in any negative-UTC-offset timezone (all of the
  // US) -- this is exactly the bug formatDateRead's y/m/d construction
  // avoids. This test only catches a regression in timezones behind UTC,
  // but that's every timezone this site's owner and most US visitors run in.
  it('does not shift a year-boundary date to the previous year', () => {
    expect(formatDateRead('2026-01-01')).toBe('Read Jan 2026')
  })
})

describe('splitTitle', () => {
  it('splits at the first colon', () => {
    expect(splitTitle('Four Portraits, One Jesus: A Survey of Jesus and the Gospels')).toEqual({
      main: 'Four Portraits, One Jesus',
      sub: 'A Survey of Jesus and the Gospels',
    })
    expect(splitTitle('Do Aliens Speak Physics?: And Other Questions')).toEqual({
      main: 'Do Aliens Speak Physics?',
      sub: 'And Other Questions',
    })
  })

  it('uses the separate subtitle when the title has no colon', () => {
    expect(splitTitle('Deepsix', 'A Novel')).toEqual({ main: 'Deepsix', sub: 'A Novel' })
    expect(splitTitle('Deepsix')).toEqual({ main: 'Deepsix', sub: null })
  })
})
