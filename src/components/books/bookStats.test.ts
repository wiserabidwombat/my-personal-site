import { describe, expect, it } from 'vitest'
import { computeBookStats } from './bookStats'
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
    rereadCount: 0,
    isFavorite: false,
    ...overrides,
  }
}

describe('computeBookStats', () => {
  it('returns zeros and nulls for an empty library', () => {
    expect(computeBookStats([])).toEqual({
      totalRead: 0,
      readThisYear: 0,
      averageRating: null,
      mostReadAuthor: null,
    })
  })

  it('counts total read and read-this-year separately', () => {
    const now = new Date('2026-09-18')
    const books = [
      makeBook({ hardcoverBookId: 1, dateRead: '2026-01-01' }),
      makeBook({ hardcoverBookId: 2, dateRead: '2025-06-01' }),
      makeBook({ hardcoverBookId: 3, dateRead: null }),
    ]
    const stats = computeBookStats(books, now)
    expect(stats.totalRead).toBe(3)
    expect(stats.readThisYear).toBe(1)
  })

  it('averages ratings, ignoring books with no rating', () => {
    const books = [
      makeBook({ hardcoverBookId: 1, rating: 5 }),
      makeBook({ hardcoverBookId: 2, rating: 3 }),
      makeBook({ hardcoverBookId: 3, rating: null }),
    ]
    expect(computeBookStats(books).averageRating).toBe(4)
  })

  it('finds the most-read author when one has strictly more books', () => {
    const books = [
      makeBook({ hardcoverBookId: 1, author: 'Author A' }),
      makeBook({ hardcoverBookId: 2, author: 'Author B' }),
      makeBook({ hardcoverBookId: 3, author: 'Author A' }),
    ]
    expect(computeBookStats(books).mostReadAuthor).toBe('Author A')
  })

  it('breaks a tied count by first occurrence', () => {
    const books = [
      makeBook({ hardcoverBookId: 1, author: 'Author A' }),
      makeBook({ hardcoverBookId: 2, author: 'Author B' }),
    ]
    expect(computeBookStats(books).mostReadAuthor).toBe('Author A')
  })
})
