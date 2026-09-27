import { NARROW_WIDTH } from '../game/skyline'

// Look-and-feel settings for Skyline Defense (not gameplay -- those live in
// game/tuning.ts), with separate values for wide screens (>= NARROW_WIDTH)
// and phones. Brightness values are multipliers (1 = unchanged).
const WIDE = {
  // Everything in the skyline image outside a defended building, so the
  // buildings you're defending stand out. Wide screens show the whole
  // skyline, so the scenery is pushed back further.
  sceneryBrightness: 0.5,
  // Share of the way to grayscale (0 = full color, 1 = gray).
  sceneryDesaturation: 0.35,
  // A destroyed building's "lights out": fully desaturated, then dimmed --
  // kept well below the scenery so it still reads as destroyed.
  destroyedBrightness: 0.3,
  // Faint edge on defended buildings during play; 0 turns it off.
  defendedEdgeAlpha: 0.32,
  // Size multiplier for the HUD's city status icons.
  statusIconScale: 1.5,
}

const PHONE: typeof WIDE = {
  sceneryBrightness: 0.65,
  sceneryDesaturation: 0.2,
  destroyedBrightness: 0.45,
  defendedEdgeAlpha: 0.22,
  statusIconScale: 1,
}

export function visualsFor(width: number) {
  return width >= NARROW_WIDTH ? WIDE : PHONE
}

// Settings shared by every screen size.
export const VISUALS = {
  // Neon outline around each defended building while the "Wave N" title
  // shows: pulsing and fading out (steady under reduced motion).
  revealSeconds: 1.5,
  revealPulsesPerSecond: 3,
  revealLineWidth: 2,
  // City status icons at scale 1: the tallest icon's height, the narrowest
  // an icon may be (thin towers are widened to this), and the gap, in px.
  statusIconHeight: 22,
  statusIconMinWidth: 6,
  statusIconGap: 6,
} as const
