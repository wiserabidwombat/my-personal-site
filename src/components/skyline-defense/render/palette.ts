// Canvas colors, read from the site's CSS tokens on the game's element
// (inside .night-scene, so always the dark synthwave values). A few colors
// have no site token: Bank of America Plaza's signature green outline, the
// meteors' hot orange, and the alien lime of the bonus targets.
export type Palette = {
  sky: string
  skyHigh: string
  pink: string
  cyan: string
  purple: string
  text: string
  dark: string
  darkEdge: string
  bofaGreen: string
  meteor: string
  lime: string
}

export function readPalette(element: Element): Palette {
  const styles = getComputedStyle(element)
  const token = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback
  return {
    sky: token('--deep-space-black', '#0a0612'),
    skyHigh: token('--deep-space-purple', '#150a24'),
    pink: token('--neon-pink', '#ff2bd6'),
    cyan: token('--laser-cyan', '#00f0ff'),
    purple: token('--cyber-purple', '#8b2fe0'),
    text: '#e2e8f0',
    dark: '#0d0913',
    darkEdge: '#3a3148',
    bofaGreen: '#39ff88',
    meteor: '#ffb347',
    lime: '#9dff4a',
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
