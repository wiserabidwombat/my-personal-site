import { describe, expect, it } from 'vitest'
import { mapCurrentlyReading, readingProgress, type HardcoverCurrentlyReadingRaw } from './currently-reading'

function makeRaw(overrides: Partial<HardcoverCurrentlyReadingRaw> = {}): HardcoverCurrentlyReadingRaw {
  return {
    book_id: 7,
    book: {
      title: 'In Progress',
      subtitle: 'A Subtitle',
      slug: 'in-progress',
      pages: 400,
      image: { url: 'https://assets.hardcover.app/in-progress.jpg' },
      contributions: [
        { contribution: null, author: { name: 'Cur Rent' } },
        { contribution: 'Narrator', author: { name: 'Nar Rator' } },
      ],
    },
    edition: {
      title: 'Edition Title',
      subtitle: 'Edition Subtitle',
      pages: 200,
      audio_seconds: 36000,
      image: { url: 'https://assets.hardcover.app/edition.jpg' },
      contributions: [{ contribution: null, author: { name: 'Edition Author' } }],
    },
    user_book_reads: [],
    ...overrides,
  }
}

const noBookData = { title: null, subtitle: null, slug: null, pages: null, image: null, contributions: [] }

describe('mapCurrentlyReading', () => {
  it('maps a book being currently read from book-level data', () => {
    expect(mapCurrentlyReading(makeRaw())).toEqual({
      hardcoverBookId: 7,
      title: 'In Progress',
      subtitle: 'A Subtitle',
      author: 'Cur Rent',
      coverImageUrl: 'https://assets.hardcover.app/in-progress.jpg',
      hardcoverUrl: 'https://hardcover.app/books/in-progress',
      progressPercent: null,
    })
  })

  it('falls back to edition-level title, subtitle, cover, and authors', () => {
    const book = mapCurrentlyReading(makeRaw({ book: noBookData }))
    expect(book.title).toBe('Edition Title')
    expect(book.subtitle).toBe('Edition Subtitle')
    expect(book.coverImageUrl).toBe('https://assets.hardcover.app/edition.jpg')
    expect(book.author).toBe('Edition Author')
  })

  it('does not mix a book title with an edition subtitle', () => {
    const raw = makeRaw({ book: { ...makeRaw().book, subtitle: null } })
    expect(mapCurrentlyReading(raw).subtitle).toBeNull()
  })

  it('maps a missing cover image to null when neither record has one', () => {
    const raw = makeRaw({ book: { ...makeRaw().book, image: null }, edition: null })
    expect(mapCurrentlyReading(raw).coverImageUrl).toBeNull()
  })
})

describe('readingProgress', () => {
  it('is null with no read-through logged', () => {
    expect(readingProgress(makeRaw())).toBeNull()
  })

  it('uses pages against the read-through edition first', () => {
    const raw = makeRaw({
      user_book_reads: [{ progress_pages: 50, progress_seconds: null, edition: { pages: 100, audio_seconds: null } }],
    })
    expect(readingProgress(raw)).toBe(50)
  })

  it('falls back to the user edition, then the book, for page count', () => {
    const read = { progress_pages: 50, progress_seconds: null, edition: null }
    expect(readingProgress(makeRaw({ user_book_reads: [read] }))).toBe(25)
    expect(readingProgress(makeRaw({ user_book_reads: [read], edition: null }))).toBe(13)
  })

  it('uses listening time for audiobooks', () => {
    const raw = makeRaw({ user_book_reads: [{ progress_pages: null, progress_seconds: 9000, edition: null }] })
    expect(readingProgress(raw)).toBe(25)
  })

  it('clamps to 100 and ignores zero progress', () => {
    const over = { progress_pages: 500, progress_seconds: null, edition: { pages: 400, audio_seconds: null } }
    const none = { progress_pages: 0, progress_seconds: 0, edition: null }
    expect(readingProgress(makeRaw({ user_book_reads: [over] }))).toBe(100)
    expect(readingProgress(makeRaw({ user_book_reads: [none] }))).toBeNull()
  })
})
