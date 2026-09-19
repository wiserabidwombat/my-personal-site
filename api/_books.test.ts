import { describe, expect, it } from 'vitest'
import { mapUserBook, type HardcoverUserBookRaw } from './books'

function makeRaw(overrides: Partial<HardcoverUserBookRaw> = {}): HardcoverUserBookRaw {
  return {
    book_id: 1,
    rating: 4.5,
    read_count: 1,
    last_read_date: '2026-03-14',
    starred: false,
    book: {
      title: 'Some Book',
      pages: 300,
      image: { url: 'https://assets.hardcover.app/cover.jpg' },
      contributions: [{ author: { name: 'Jane Author' } }],
    },
    ...overrides,
  }
}

describe('mapUserBook', () => {
  it('maps a single-author, single-read book', () => {
    const book = mapUserBook(makeRaw())
    expect(book).toEqual({
      hardcoverBookId: 1,
      title: 'Some Book',
      author: 'Jane Author',
      rating: 4.5,
      pageCount: 300,
      dateRead: '2026-03-14',
      coverImageUrl: 'https://assets.hardcover.app/cover.jpg',
      rereadCount: 0,
      isFavorite: false,
    })
  })

  it('computes rereadCount as read_count - 1, floored at 0', () => {
    expect(mapUserBook(makeRaw({ read_count: 3 })).rereadCount).toBe(2)
    expect(mapUserBook(makeRaw({ read_count: 0 })).rereadCount).toBe(0)
  })

  it('joins multiple contributors with a comma', () => {
    const raw = makeRaw({
      book: {
        ...makeRaw().book,
        contributions: [{ author: { name: 'First Author' } }, { author: { name: 'Second Author' } }],
      },
    })
    expect(mapUserBook(raw).author).toBe('First Author, Second Author')
  })

  it('skips a contribution with a null author', () => {
    const raw = makeRaw({
      book: {
        ...makeRaw().book,
        contributions: [{ author: { name: 'Real Author' } }, { author: null }],
      },
    })
    expect(mapUserBook(raw).author).toBe('Real Author')
  })

  it('maps a missing cover image to null', () => {
    const raw = makeRaw({ book: { ...makeRaw().book, image: null } })
    expect(mapUserBook(raw).coverImageUrl).toBeNull()
  })

  it('maps starred: true to isFavorite: true', () => {
    expect(mapUserBook(makeRaw({ starred: true })).isFavorite).toBe(true)
  })
})
