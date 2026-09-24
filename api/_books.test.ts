import { describe, expect, it } from 'vitest'
import { joinAuthors, mapUserBook, type HardcoverUserBookRaw } from './books'

function makeRaw(overrides: Partial<HardcoverUserBookRaw> = {}): HardcoverUserBookRaw {
  return {
    book_id: 1,
    rating: 4.5,
    read_count: 1,
    last_read_date: '2026-03-14',
    starred: false,
    book: {
      title: 'Some Book',
      slug: 'some-book',
      pages: 300,
      image: { url: 'https://assets.hardcover.app/cover.jpg' },
      contributions: [{ contribution: null, author: { name: 'Jane Author' } }],
    },
    edition: {
      title: 'Ein Buch',
      pages: 320,
      image: { url: 'https://assets.hardcover.app/edition-cover.jpg' },
      contributions: [{ contribution: null, author: { name: 'Edition Author' } }],
    },
    ...overrides,
  }
}

const noBookData = { title: null, slug: null, pages: null, image: null, contributions: [] }

describe('mapUserBook', () => {
  it('maps a single-author, single-read book from book-level data', () => {
    expect(mapUserBook(makeRaw())).toEqual({
      hardcoverBookId: 1,
      title: 'Some Book',
      author: 'Jane Author',
      rating: 4.5,
      pageCount: 300,
      dateRead: '2026-03-14',
      coverImageUrl: 'https://assets.hardcover.app/cover.jpg',
      hardcoverUrl: 'https://hardcover.app/books/some-book',
      rereadCount: 0,
      isFavorite: false,
    })
  })

  it('prefers book-level title, cover, and authors over the edition', () => {
    const book = mapUserBook(makeRaw())
    expect(book.title).toBe('Some Book')
    expect(book.coverImageUrl).toBe('https://assets.hardcover.app/cover.jpg')
    expect(book.author).toBe('Jane Author')
  })

  it('falls back to edition-level data when the book lacks it', () => {
    const book = mapUserBook(makeRaw({ book: noBookData }))
    expect(book.title).toBe('Ein Buch')
    expect(book.coverImageUrl).toBe('https://assets.hardcover.app/edition-cover.jpg')
    expect(book.author).toBe('Edition Author')
    expect(book.pageCount).toBe(320)
  })

  it('falls back per field, treating blank strings as missing', () => {
    const raw = makeRaw({ book: { ...makeRaw().book, title: '  ', image: { url: '' } } })
    const book = mapUserBook(raw)
    expect(book.title).toBe('Ein Buch')
    expect(book.coverImageUrl).toBe('https://assets.hardcover.app/edition-cover.jpg')
    expect(book.author).toBe('Jane Author')
  })

  it('handles a missing edition and missing data everywhere', () => {
    const book = mapUserBook(makeRaw({ book: noBookData, edition: null }))
    expect(book.title).toBe('Untitled')
    expect(book.author).toBe('')
    expect(book.coverImageUrl).toBeNull()
    expect(book.hardcoverUrl).toBeNull()
    expect(book.pageCount).toBeNull()
  })

  it('computes rereadCount as read_count - 1, floored at 0', () => {
    expect(mapUserBook(makeRaw({ read_count: 3 })).rereadCount).toBe(2)
    expect(mapUserBook(makeRaw({ read_count: 0 })).rereadCount).toBe(0)
  })

  it('maps starred: true to isFavorite: true', () => {
    expect(mapUserBook(makeRaw({ starred: true })).isFavorite).toBe(true)
  })
})

describe('joinAuthors', () => {
  it('joins multiple authors with a comma', () => {
    expect(
      joinAuthors([
        { contribution: null, author: { name: 'First Author' } },
        { contribution: 'Author', author: { name: 'Second Author' } },
      ]),
    ).toBe('First Author, Second Author')
  })

  it('drops narrators, translators, and other non-author roles', () => {
    expect(
      joinAuthors([
        { contribution: 'Narrator', author: { name: 'Bronson Pinchot' } },
        { contribution: null, author: { name: 'Stephen King' } },
        { contribution: 'Translator', author: { name: 'Some Translator' } },
      ]),
    ).toBe('Stephen King')
  })

  it('keeps everyone when no contributor is marked as an author', () => {
    expect(joinAuthors([{ contribution: 'Editor', author: { name: 'Ed Itor' } }])).toBe('Ed Itor')
  })

  it('skips a contribution with a null author', () => {
    expect(
      joinAuthors([
        { contribution: null, author: { name: 'Real Author' } },
        { contribution: null, author: null },
      ]),
    ).toBe('Real Author')
  })
})
