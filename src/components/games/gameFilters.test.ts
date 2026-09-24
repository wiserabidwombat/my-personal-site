import { describe, expect, it } from 'vitest'
import type { BoardGame } from '../../types/board-game'
import { pickRandomGame } from './gameFilters'

function makeGame(overrides: Partial<BoardGame>): BoardGame {
  return {
    id: overrides.id ?? overrides.name ?? 'game',
    name: 'Untitled Game',
    tags: [],
    categories: [],
    mechanics: [],
    rating: null,
    status: null,
    condition: null,
    owned: true,
    playersMin: null,
    playersMax: null,
    playtimeMinutes: null,
    minPlaytime: null,
    maxPlaytime: null,
    weight: null,
    designer: null,
    publisher: null,
    yearPublished: null,
    lastPlayed: null,
    bggLink: null,
    thumbnailUrl: null,
    imageUrl: null,
    notes: null,
    notes2: null,
    notes3: null,
    notionUrl: 'https://example.com',
    ...overrides,
  }
}

const catan = makeGame({
  id: 'catan',
  name: 'Catan',
  categories: ['Strategy', 'Negotiation'],
  mechanics: ['Trading', 'Dice Rolling'],
  playersMin: 3,
  playersMax: 4,
  minPlaytime: 60,
  maxPlaytime: 90,
})
const codenames = makeGame({
  id: 'codenames',
  name: 'Codenames',
  categories: ['Party', 'Word Game'],
  mechanics: ['Team-Based'],
  playersMin: 2,
  playersMax: 8,
  minPlaytime: 15,
  maxPlaytime: 15,
})
const gloomhaven = makeGame({
  id: 'gloomhaven',
  name: 'Gloomhaven',
  categories: ['Strategy', 'Adventure'],
  mechanics: ['Campaign', 'Hand Management'],
  playersMin: 1,
  playersMax: 4,
  minPlaytime: 90,
  maxPlaytime: 150,
})
const noDataGame = makeGame({ id: 'mystery', name: 'Mystery Game' })

const library = [catan, codenames, gloomhaven, noDataGame]

describe('pickRandomGame', () => {
  it('returns null for an empty list', () => {
    expect(pickRandomGame([])).toBeNull()
  })

  it('always returns a member of the eligible set', () => {
    for (let i = 0; i < 50; i++) {
      const picked = pickRandomGame(library)
      expect(picked).not.toBeNull()
      expect(library).toContain(picked)
    }
  })

  it('is not deterministic or biased toward array order across repeated calls', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) {
      const picked = pickRandomGame(library)
      if (picked) seen.add(picked.id)
    }
    // With 200 draws from 4 items, every item should surface at least once;
    // a picker that always returned e.g. the first element would fail this.
    expect(seen.size).toBe(library.length)
  })
})
