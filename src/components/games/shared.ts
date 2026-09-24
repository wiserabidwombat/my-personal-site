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
