import type { BoardGame } from '../../types/board-game'

// The Games inventory's filter/sort state. It lives in the /games URL search
// params (see src/routes/games.tsx), so every filtered view is shareable;
// undefined / empty means "not filtering on this".
export const PLAYER_OPTIONS = ['1', '2', '3', '4', '5+'] as const
export const TIME_OPTIONS = [
  { value: 'under-30', label: 'Under 30 min' },
  { value: '30-60', label: '30–60 min' },
  { value: '1-2h', label: '1–2 hrs' },
  { value: '2h-plus', label: '2+ hrs' },
] as const
export const STATUS_OPTIONS = [
  { value: 'played', label: 'Played' },
  { value: 'unplayed', label: 'Unplayed' },
] as const
export const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating (high to low)' },
  { value: 'name', label: 'Name (A–Z)' },
] as const

export type PlayerOption = (typeof PLAYER_OPTIONS)[number]
export type TimeOption = (typeof TIME_OPTIONS)[number]['value']
export type StatusOption = (typeof STATUS_OPTIONS)[number]['value']
export type SortOption = (typeof SORT_OPTIONS)[number]['value']

export type InventorySearch = {
  q?: string
  players?: PlayerOption
  time?: TimeOption
  status?: StatusOption
  categories?: string[]
  mechanics?: string[]
  sort?: SortOption // omitted = 'rating', the default
}

// TanStack Router JSON-parses search params, so a hand-typed ?players=2
// arrives as the number 2 -- accept numbers as their string form.
function pick<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  const text = typeof value === 'number' ? String(value) : value
  return typeof text === 'string' && (allowed as readonly string[]).includes(text) ? (text as T) : undefined
}

function stringList(value: unknown): string[] | undefined {
  const list = (Array.isArray(value) ? value : [value]).filter((v): v is string => typeof v === 'string' && v !== '')
  return list.length ? list : undefined
}

// Kept exactly as typed (not trimmed): the input is bound to this value, so
// trimming would eat the space before a second word. Whitespace-only = none.
function searchText(value: unknown): string | undefined {
  const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value : ''
  return text.trim() === '' ? undefined : text
}

// Used as the route's validateSearch: anything unrecognized (a hand-edited
// or stale URL) is dropped rather than breaking the page.
export function parseInventorySearch(search: Record<string, unknown>): InventorySearch {
  return {
    q: searchText(search.q),
    players: pick(search.players, PLAYER_OPTIONS),
    time: pick(search.time, TIME_OPTIONS.map((o) => o.value)),
    status: pick(search.status, STATUS_OPTIONS.map((o) => o.value)),
    categories: stringList(search.categories),
    mechanics: stringList(search.mechanics),
    sort: pick(search.sort, ['name'] as const), // 'rating' is the default, so never stored
  }
}

// A game fits a player count when that count falls within its min–max
// range; "5+" means the game supports five or more.
function matchesPlayers(game: BoardGame, players: PlayerOption): boolean {
  if (game.playersMin == null || game.playersMax == null) return false
  if (players === '5+') return game.playersMax >= 5
  const count = Number(players)
  return game.playersMin <= count && count <= game.playersMax
}

// Uses playtimeMinutes, the only playtime field Notion fills (the separate
// min/max playtime fields are empty for every game).
function matchesTime(game: BoardGame, time: TimeOption): boolean {
  const minutes = game.playtimeMinutes
  if (minutes == null) return false
  switch (time) {
    case 'under-30':
      return minutes < 30
    case '30-60':
      return minutes >= 30 && minutes <= 60
    case '1-2h':
      return minutes > 60 && minutes <= 120
    case '2h-plus':
      return minutes > 120
  }
}

// Every active filter combines (AND), including search and every selected
// category and mechanic.
export function filterInventory(games: BoardGame[], search: InventorySearch): BoardGame[] {
  const query = search.q?.trim().toLowerCase() ?? ''
  return games.filter((game) => {
    const categories = game.categories ?? []
    const mechanics = game.mechanics ?? []
    return (
      (query === '' || game.name.toLowerCase().includes(query)) &&
      (!search.players || matchesPlayers(game, search.players)) &&
      (!search.time || matchesTime(game, search.time)) &&
      (!search.status || game.status?.toLowerCase() === search.status) &&
      (search.categories ?? []).every((c) => categories.includes(c)) &&
      (search.mechanics ?? []).every((m) => mechanics.includes(m))
    )
  })
}

export function sortInventory(games: BoardGame[], sort: SortOption = 'rating'): BoardGame[] {
  const byName = (a: BoardGame, b: BoardGame) => a.name.localeCompare(b.name)
  if (sort === 'name') return [...games].sort(byName)
  // Highest rating first; unrated games last; ties broken by name.
  return [...games].sort((a, b) => (b.rating ?? -Infinity) - (a.rating ?? -Infinity) || byName(a, b))
}

export function hasActiveFilters(search: InventorySearch): boolean {
  return Boolean(
    search.q || search.players || search.time || search.status || search.categories?.length || search.mechanics?.length,
  )
}
