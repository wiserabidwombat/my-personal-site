import { cn } from 'cn'
import type { BoardGame } from '../../types/board-game'

export const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

export function uniqueSorted(values: string[][]) {
  return [...new Set(values.flat())].sort((a, b) => a.localeCompare(b))
}

export function formatRange(min: number | null, max: number | null, unit = '') {
  if (min == null && max == null) return '—'
  const suffix = unit ? ` ${unit}` : ''
  if (min != null && max != null && min !== max) return `${min}–${max}${suffix}`
  return `${min ?? max}${suffix}`
}

// Some Notion fields (e.g. Publisher) store multiple values as a single
// comma-separated string. Cap the displayed list so a long value doesn't
// overwhelm the modal.
export function formatCommaList(value: string | null, max = 3) {
  if (!value) return '—'
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return items.slice(0, max).join(', ')
}

// There's no separate numeric-ID field synced from Notion -- bggLink is a
// full URL (e.g. https://boardgamegeek.com/boardgame/174430/gloomhaven), so
// pull the ID out of it rather than adding a new Notion property.
export function extractBggId(bggLink: string | null): string | null {
  if (!bggLink) return null
  const match = bggLink.match(/\/boardgame\/(\d+)/)
  return match ? match[1] : null
}

// Game cards (inventory and Favorites) share the Blog cards' hover/focus
// language: one border color, a slight lift and brighter border on hover or
// keyboard focus, and a visible cyan ring for keyboard users. h-full + flex
// keeps cards in a row equal height.
export const gameCardClass = cn(
  'group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 text-left transition duration-300',
  'hover:-translate-y-1 hover:border-[var(--laser-cyan)]/70 motion-reduce:hover:translate-y-0',
  'focus-visible:-translate-y-1 focus-visible:border-[var(--laser-cyan)]/70 focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-space-black)] focus-visible:outline-none',
)

// Notion only fills the single "Playtime (min)" value (the min/max
// playtime fields are empty for every game), so prefer it and fall back to
// a range only if one ever gets filled in.
export function formatPlaytime(game: Pick<BoardGame, 'playtimeMinutes' | 'minPlaytime' | 'maxPlaytime'>): string {
  if (game.playtimeMinutes != null) return `${game.playtimeMinutes} min`
  return formatRange(game.minPlaytime, game.maxPlaytime, 'min')
}

// The rating is BoardGameGeek's community average (e.g. 7.70167), not a
// personal score, so it's always shown labeled "BGG" to one decimal.
export function formatBggRating(rating: number | null): string {
  return rating != null ? rating.toFixed(1) : '—'
}
