import { describe, expect, it } from 'vitest'
import type { BoardGame } from '../../types/board-game'
import { filterInventory, hasActiveFilters, parseInventorySearch, sortInventory } from './inventoryFilters'

function game(overrides: Partial<BoardGame>): BoardGame {
  return {
    id: overrides.name ?? 'id',
    name: 'Game',
    tags: [],
    categories: [],
    mechanics: [],
    rating: null,
    status: 'Played',
    condition: null,
    owned: true,
    playersMin: 1,
    playersMax: 4,
    playtimeMinutes: 60,
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
    notionUrl: '',
    ...overrides,
  }
}

const names = (games: BoardGame[]) => games.map((g) => g.name)

describe('parseInventorySearch', () => {
  it('keeps valid values and drops unknown ones', () => {
    expect(
      parseInventorySearch({ q: 'hor', players: '5+', time: 'nope', status: 'played', sort: 'name', extra: 1 }),
    ).toEqual({ q: 'hor', players: '5+', status: 'played', sort: 'name' })
  })

  it('keeps search text as typed, so a trailing space before the next word survives', () => {
    expect(parseInventorySearch({ q: 'ark ' })).toEqual({ q: 'ark ' })
    expect(parseInventorySearch({ q: '   ' })).toEqual({})
  })

  it('accepts a player count the router parsed as a number (e.g. a hand-typed ?players=2)', () => {
    expect(parseInventorySearch({ players: 2, q: 7 })).toEqual({ players: '2', q: '7' })
  })

  it('accepts a single category string or an array, and never stores the default sort', () => {
    expect(parseInventorySearch({ categories: 'Horror', mechanics: ['Dice', ''], sort: 'rating' })).toEqual({
      categories: ['Horror'],
      mechanics: ['Dice'],
    })
  })
})

describe('filterInventory', () => {
  it('matches a player count inside the min–max range, and 5+ against the max', () => {
    const games = [
      game({ name: 'Solo', playersMin: 1, playersMax: 1 }),
      game({ name: 'Duel', playersMin: 2, playersMax: 2 }),
      game({ name: 'Party', playersMin: 3, playersMax: 8 }),
    ]
    expect(names(filterInventory(games, { players: '2' }))).toEqual(['Duel'])
    expect(names(filterInventory(games, { players: '5+' }))).toEqual(['Party'])
  })

  it('buckets playtime with inclusive 30 and 60 minute edges', () => {
    const games = [15, 30, 60, 61, 120, 121].map((m) => game({ name: `${m}`, playtimeMinutes: m }))
    expect(names(filterInventory(games, { time: 'under-30' }))).toEqual(['15'])
    expect(names(filterInventory(games, { time: '30-60' }))).toEqual(['30', '60'])
    expect(names(filterInventory(games, { time: '1-2h' }))).toEqual(['61', '120'])
    expect(names(filterInventory(games, { time: '2h-plus' }))).toEqual(['121'])
  })

  it('combines search, status, and every selected category/mechanic', () => {
    const games = [
      game({ name: 'Horrified', status: 'Played', categories: ['Horror', 'Monsters'], mechanics: ['Co-op'] }),
      game({ name: 'Horror Night', status: 'Unplayed', categories: ['Horror'], mechanics: ['Co-op'] }),
      game({ name: 'Arkham', status: 'Played', categories: ['Horror'], mechanics: ['Dice'] }),
    ]
    expect(names(filterInventory(games, { q: 'HORR', status: 'played' }))).toEqual(['Horrified'])
    expect(names(filterInventory(games, { categories: ['Horror', 'Monsters'] }))).toEqual(['Horrified'])
    expect(names(filterInventory(games, { categories: ['Horror'], mechanics: ['Dice'] }))).toEqual(['Arkham'])
  })
})

describe('sortInventory', () => {
  const games = [game({ name: 'B', rating: 7 }), game({ name: 'A', rating: null }), game({ name: 'C', rating: 8 })]

  it('sorts by rating high to low with unrated last', () => {
    expect(names(sortInventory(games))).toEqual(['C', 'B', 'A'])
  })

  it('sorts by name A–Z', () => {
    expect(names(sortInventory(games, 'name'))).toEqual(['A', 'B', 'C'])
  })
})

describe('hasActiveFilters', () => {
  it('ignores sort, which is not a filter', () => {
    expect(hasActiveFilters({ sort: 'name' })).toBe(false)
    expect(hasActiveFilters({ categories: ['Horror'] })).toBe(true)
  })
})
