import { describe, expect, it } from 'vitest'
import { statusCardClass, statusGridClass } from './statusGrid'

describe('statusGridClass', () => {
  it('fits one row for 2 and 3 cards', () => {
    expect(statusGridClass(2)).toBe('sm:grid-cols-2')
    expect(statusGridClass(3)).toBe('sm:grid-cols-3')
  })

  it('uses 2 x 2 on tablet and one row of 4 on desktop for 4 cards', () => {
    expect(statusGridClass(4)).toBe('sm:grid-cols-2 lg:grid-cols-4')
  })

  it('lays out 5 cards as 3 + 2 on a 6-column grid', () => {
    expect(statusGridClass(5)).toBe('sm:grid-cols-6')
    expect([0, 1, 2, 3, 4].map((index) => statusCardClass(5, index))).toEqual([
      'sm:col-span-2',
      'sm:col-span-2',
      'sm:col-span-2',
      'sm:col-span-3',
      'sm:col-span-3',
    ])
  })

  it('adds no spans for other counts', () => {
    expect([2, 3, 4].flatMap((count) => [0, 1].map((index) => statusCardClass(count, index)))).toEqual([
      '',
      '',
      '',
      '',
      '',
      '',
    ])
  })
})
