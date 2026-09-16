export const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

export const PLAYER_COUNT_THRESHOLDS = [1, 2, 3, 4, 5, 6, 8]
export const PLAYTIME_THRESHOLDS = [15, 30, 45, 60, 90, 120, 180]

// Exact player-count options for the Random Game Picker's single-value
// dropdown (1-8 inclusive) -- distinct from PLAYER_COUNT_THRESHOLDS above,
// which is a set of "at least N" bucket thresholds (and skips 7) for the
// inventory page's separate Min/Max Players filters.
export const PLAYER_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

export function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
}

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
