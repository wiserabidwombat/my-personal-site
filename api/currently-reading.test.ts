import { describe, expect, it } from 'vitest'
import { mapCurrentlyReading, type HardcoverCurrentlyReadingRaw } from './currently-reading'

function makeRaw(overrides: Partial<HardcoverCurrentlyReadingRaw> = {}): HardcoverCurrentlyReadingRaw {
  return {
    book_id: 7,
    book: {
      title: 'In Progress',
      image: { url: 'https://assets.hardcover.app/in-progress.jpg' },
      contributions: [{ author: { name: 'Cur Rent' } }],
    },
    ...overrides,
  }
}

describe('mapCurrentlyReading', () => {
  it('maps a book being currently read', () => {
    expect(mapCurrentlyReading(makeRaw())).toEqual({
      hardcoverBookId: 7,
      title: 'In Progress',
      author: 'Cur Rent',
      coverImageUrl: 'https://assets.hardcover.app/in-progress.jpg',
    })
  })

  it('maps a missing cover image to null', () => {
    const raw = makeRaw({ book: { ...makeRaw().book, image: null } })
    expect(mapCurrentlyReading(raw).coverImageUrl).toBeNull()
  })

  it('joins multiple contributors with a comma', () => {
    const raw = makeRaw({
      book: {
        ...makeRaw().book,
        contributions: [{ author: { name: 'First' } }, { author: { name: 'Second' } }],
      },
    })
    expect(mapCurrentlyReading(raw).author).toBe('First, Second')
  })
})
