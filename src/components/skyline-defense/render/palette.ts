// Canvas colors, read from the site's CSS tokens on the game's element
// (inside .night-scene, so always the dark values: synthwave normally, and
// the dark Halloween palette during the season, via halloween.css). A few
// colors have no site token; their values for each look live in
// SEASON_COLORS below.
export type Season = 'none' | 'halloween'

export type Palette = {
  season: Season
  sky: string
  skyHigh: string
  pink: string
  cyan: string
  purple: string
  text: string
  dark: string
  darkEdge: string
  meteor: string
  lime: string
}

type SeasonColors = Pick<Palette, 'text' | 'dark' | 'darkEdge' | 'meteor' | 'lime'>

// Colors with no site token. Normally: the meteors' hot orange, and the
// alien lime of the bonus targets (never the cyan of the defended
// buildings). During Halloween the
// tokens turn magenta into pumpkin orange and cyan into toxic green, so
// these move out of their way: meteors burn candle yellow (distinct from
// the orange chain blasts), bonus targets turn witchy violet (distinct from
// the green buildings), and text warms to bone white.
export const SEASON_COLORS: Record<Season, SeasonColors> = {
  none: {
    text: '#e2e8f0',
    dark: '#0d0913',
    darkEdge: '#3a3148',
    meteor: '#ffb347',
    lime: '#9dff4a',
  },
  halloween: {
    text: '#f3e9dc',
    dark: '#0c0710',
    darkEdge: '#3f2a47',
    meteor: '#ffd23f',
    lime: '#c77dff',
  },
}

// `season` picks the non-token colors; the tokens already follow
// <html data-season> through CSS.
export function readPalette(element: Element, season: Season = 'none'): Palette {
  const styles = getComputedStyle(element)
  const token = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
  return {
    season,
    sky: token('--deep-space-black', '#0a0612'),
    skyHigh: token('--deep-space-purple', '#150a24'),
    pink: token('--neon-pink', '#ff2bd6'),
    cyan: token('--laser-cyan', '#00f0ff'),
    purple: token('--cyber-purple', '#8b2fe0'),
    ...SEASON_COLORS[season],
  }
}

// '#rrggbb' plus alpha as an rgba() string (canvas has no color-mix).
export function alpha(hex: string, opacity: number): string {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return hex
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`
}

// Deterministic 0-1 noise, for star and window placement that doesn't
// jump around between frames.
export function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}
