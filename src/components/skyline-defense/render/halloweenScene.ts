import { blastLifetime, blastMaxRadius } from '../game/geometry'
import { TUNING } from '../game/tuning'
import type { Blast, GameState } from '../game/types'
import { alpha, noise, type Palette } from './palette'

// Halloween-only scenery and effects (cosmetic: nothing here reads or
// changes gameplay state).

const MOON_BONE = '#f6e7c8'
const MOON_SHADE = '#d9c3a0'

// A large, soft full moon low behind the skyline, in the chunky pixel style
// of the site's Halloween sprites: square cells, a few darker craters, and
// a wide glow -- but no outline, and pale enough that it reads as sky, not
// a target. Drawn before the city layer, so its lower half sinks into the
// skyline's faded top edge.
export function drawMoon(ctx: CanvasRenderingContext2D, state: GameState, horizonY: number) {
  const radius = Math.min(Math.max(Math.min(state.width, state.height) * 0.11, 36), 110)
  const cx = state.width * (state.width < 560 ? 0.72 : 0.8)
  const cy = horizonY + radius * 0.35
  const cell = Math.max(3, Math.round(radius / 12))

  ctx.save()
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 2.6)
  glow.addColorStop(0, alpha(MOON_BONE, 0.16))
  glow.addColorStop(1, alpha(MOON_BONE, 0))
  ctx.fillStyle = glow
  ctx.fillRect(cx - radius * 2.6, cy - radius * 2.6, radius * 5.2, radius * 5.2)

  ctx.globalAlpha = 0.4
  const craters = [
    [-0.35, -0.2, 0.22],
    [0.25, 0.15, 0.28],
    [0.1, -0.45, 0.14],
    [-0.15, 0.4, 0.16],
  ]
  const steps = Math.ceil(radius / cell)
  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      const x = i * cell
      const y = j * cell
      if (Math.hypot(x, y) > radius) continue
      const inCrater = craters.some(([u, v, r]) => Math.hypot(x / radius - u, y / radius - v) < r)
      ctx.fillStyle = inCrater || noise(i * 17 + j * 31) > 0.9 ? MOON_SHADE : MOON_BONE
      ctx.fillRect(cx + x - cell / 2, cy + y - cell / 2, cell, cell)
    }
  }
  ctx.restore()
}

// Whether a blast is the boss's: its killing explosion (a chain blast much
// bigger than a full blast) or its impact flash (an impact much bigger
// than a meteor's).
function isBossBlast(blast: Blast, state: GameState): boolean {
  if (blast.kind === 'chain') return blast.maxRadius > blastMaxRadius(state.width, state.height) * 1.5
  if (blast.kind === 'impact') return blast.maxRadius > TUNING.impactRadius * 2
  return false
}

const SPARKS = 18

// Pumpkin chunks and sparks flying out of the boss's explosion or impact,
// arcing down as they fade; placed from the blast's id and age, so there's
// no extra state. Skipped under reduced motion (the blast still shows).
export function drawBossSparks(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette, still: boolean) {
  if (still) return
  for (const blast of state.blasts) {
    if (!isBossBlast(blast, state)) continue
    const t = blast.age / blastLifetime
    if (t >= 1) continue
    ctx.save()
    ctx.globalAlpha = 1 - t
    for (let i = 0; i < SPARKS; i++) {
      const upward = blast.kind === 'impact' ? -Math.PI : 0
      const angle = upward + (i / SPARKS) * Math.PI * (blast.kind === 'impact' ? 1 : 2) + noise(blast.id + i) * 0.4
      const reach = blast.maxRadius * (0.9 + noise(blast.id * 7 + i) * 0.9) * t
      const x = blast.pos.x + Math.cos(angle) * reach
      const y = blast.pos.y + Math.sin(angle) * reach + 60 * t * t
      const chunk = i % 3 === 0
      ctx.fillStyle = chunk ? palette.pink : palette.meteor
      ctx.shadowColor = palette.pink
      ctx.shadowBlur = 6
      const size = chunk ? 4 : 2
      ctx.fillRect(x - size / 2, y - size / 2, size, size)
    }
    ctx.restore()
  }
}
