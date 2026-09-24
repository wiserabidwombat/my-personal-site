import { describe, expect, it } from 'vitest'
import type { BoardGame } from '../../types/board-game'
import { emptyGameFilters, emptyPickerFilters, filterBoardGames, filterBoardGamesForPicker, pickRandomGame } from './gameFilters'

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

describe('filterBoardGames', () => {
  it('returns every game when no filters are active', () => {
    expect(filterBoardGames(library, emptyGameFilters)).toEqual(library)
  })

  it('combines multiple active filters with AND logic', () => {
    // Strategy category AND supports 4 players: Catan and Gloomhaven both
    // qualify individually, but only Gloomhaven also has a 90+ min playtime.
    const result = filterBoardGames(library, {
      ...emptyGameFilters,
      categories: ['Strategy'],
      minPlayers: 4,
      minPlaytime: 90,
    })
    expect(result).toEqual([gloomhaven])
  })

  it('excludes games missing the data a numeric filter needs', () => {
    const result = filterBoardGames(library, { ...emptyGameFilters, minPlayers: 2 })
    expect(result.some((g) => g.id === 'mystery')).toBe(false)
  })

  it('requires every selected category to be present (not just one)', () => {
    const result = filterBoardGames(library, {
      ...emptyGameFilters,
      categories: ['Strategy', 'Party'],
    })
    expect(result).toEqual([])
  })

  it('returns an empty array when nothing matches', () => {
    const result = filterBoardGames(library, { ...emptyGameFilters, minPlayers: 20 })
    expect(result).toEqual([])
  })
})

describe('filterBoardGamesForPicker', () => {
  it('returns every game when no filters are active', () => {
    expect(filterBoardGamesForPicker(library, emptyPickerFilters)).toEqual(library)
  })

  it('matches a game whenever the entered player count falls within its min-max range, not just an exact value', () => {
    // catan is 3-4, codenames is 2-8, gloomhaven is 1-4 -- 2 falls inside
    // codenames' and gloomhaven's ranges but outside catan's.
    const result = filterBoardGamesForPicker(library, { ...emptyPickerFilters, players: 2 })
    expect(result).toEqual([codenames, gloomhaven])
  })

  it('excludes games missing the player-range data the players filter needs', () => {
    const result = filterBoardGamesForPicker(library, { ...emptyPickerFilters, players: 2 })
    expect(result.some((g) => g.id === 'mystery')).toBe(false)
  })

  it('single-selects a category rather than requiring every one', () => {
    // Both catan and gloomhaven are tagged Strategy; a single-select filter
    // should surface both, not AND them against some other category.
    const result = filterBoardGamesForPicker(library, { ...emptyPickerFilters, category: 'Strategy' })
    expect(result).toEqual([catan, gloomhaven])
  })

  it('combines category, mechanic, players, and playtime with AND logic', () => {
    const result = filterBoardGamesForPicker(library, {
      ...emptyPickerFilters,
      category: 'Strategy',
      mechanic: 'Campaign',
      players: 2,
      minPlaytime: 90,
    })
    expect(result).toEqual([gloomhaven])
  })

  it('returns an empty array when nothing matches', () => {
    const result = filterBoardGamesForPicker(library, { ...emptyPickerFilters, players: 50 })
    expect(result).toEqual([])
  })
})

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
