import { describe, expect, it } from 'vitest'
import { lastCardSpan } from './stackGrid'

describe('lastCardSpan', () => {
  it('adds no span when every row is full', () => {
    expect(lastCardSpan(4, 4)).toBe('')
    expect(lastCardSpan(6, 3)).toBe('')
  })

  it('stretches the last card across the leftover columns', () => {
    // 5 cards: 2 + 2 + 1 on tablet, 3 + 2 on desktop.
    expect(lastCardSpan(5, 3)).toBe('sm:col-span-2 lg:col-span-2')
    // 4 cards in 3 columns: full rows on tablet, 3 + 1 on desktop.
    expect(lastCardSpan(4, 3)).toBe('lg:col-span-3')
    // 3 cards in 4 columns: 2 + 1 on tablet, 3 + ... on desktop (one row of 3).
    expect(lastCardSpan(3, 4)).toBe('sm:col-span-2 lg:col-span-2')
  })

  it('resets the tablet span on desktop when the desktop row is already full', () => {
    // 3 cards: 2 + 1 on tablet (stretch), one full row of 3 on desktop.
    expect(lastCardSpan(3, 3)).toBe('sm:col-span-2 lg:col-span-1')
  })
})
