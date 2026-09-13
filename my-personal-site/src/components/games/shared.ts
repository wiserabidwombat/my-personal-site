export const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

export const PLAYER_COUNT_THRESHOLDS = [1, 2, 3, 4, 5, 6, 8]
export const PLAYTIME_THRESHOLDS = [15, 30, 45, 60, 90, 120, 180]

export function formatRange(min: number | null, max: number | null, unit = '') {
  if (min == null && max == null) return '—'
  const suffix = unit ? ` ${unit}` : ''
  if (min != null && max != null && min !== max) return `${min}–${max}${suffix}`
  return `${min ?? max}${suffix}`
}
