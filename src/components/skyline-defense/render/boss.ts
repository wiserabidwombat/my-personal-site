import { TUNING } from '../game/tuning'
import type { Boss, GameState } from '../game/types'
import { hudHeight } from './hud'
import { drawJackOLantern } from './jackOLantern'
import { alpha, noise, type Palette } from './palette'

// The Mega-meteor: a rough, dark rock much bigger than anything else on
// screen, wrapped in the meteors' hot orange glow with a fiery trail, a
// white-hot core showing through, and a crack pattern that spreads from the
// core as it takes damage (one more crack per point of health lost, all of
// them by the last point). A hit flashes it white; the cracks are drawn
// over the flash, so it never hides them. During Halloween it's drawn as a
// jack-o'-lantern instead (jackOLantern.ts), with the same cracks.

const OUTLINE_POINTS = 14
const CRACKS = 9

// The rock's outline: a circle with a bumpy edge that stays the same for a
// given boss (seeded by its id).
function rockPath(boss: Boss, spin: number): Path2D {
  const path = new Path2D()
  for (let i = 0; i < OUTLINE_POINTS; i++) {
    const angle = (i / OUTLINE_POINTS) * Math.PI * 2 + spin
    const r = boss.radius * (0.86 + noise(boss.id * 31 + i) * 0.18)
    const x = boss.pos.x + Math.cos(angle) * r
    const y = boss.pos.y + Math.sin(angle) * r
    if (i === 0) path.moveTo(x, y)
    else path.lineTo(x, y)
  }
  path.closePath()
  return path
}

// Each crack is a jagged line from near the core out toward the rim; more
// of them show, and each reaches further, as health drops. `edge` adds a
// dark border so the cracks read on a bright body (the pumpkin's rind).
function drawCracks(ctx: CanvasRenderingContext2D, boss: Boss, spin: number, palette: Palette, edge?: string) {
  const damage = 1 - boss.health / boss.maxHealth
  const shown = Math.ceil(damage * CRACKS)
  if (shown === 0) return
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = palette.meteor
  ctx.shadowBlur = 8
  for (let c = 0; c < shown; c++) {
    const base = (c / CRACKS) * Math.PI * 2 + noise(boss.id + c * 7) * 0.5 + spin
    const reach = boss.radius * (0.55 + 0.35 * damage)
    ctx.beginPath()
    let x = boss.pos.x + Math.cos(base) * boss.radius * 0.18
    let y = boss.pos.y + Math.sin(base) * boss.radius * 0.18
    ctx.moveTo(x, y)
    const steps = 4
    for (let s = 1; s <= steps; s++) {
      const angle = base + (noise(boss.id * 13 + c * 5 + s) - 0.5) * 0.9
      const r = (reach * s) / steps
      x = boss.pos.x + Math.cos(angle) * (boss.radius * 0.18 + r * 0.82)
      y = boss.pos.y + Math.sin(angle) * (boss.radius * 0.18 + r * 0.82)
      ctx.lineTo(x, y)
    }
    if (edge) {
      ctx.strokeStyle = edge
      ctx.lineWidth = 5
      ctx.stroke()
    }
    ctx.strokeStyle = alpha(palette.meteor, 0.95)
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.strokeStyle = alpha('#ffffff', 0.85)
    ctx.lineWidth = 1
    ctx.stroke()
  }
  ctx.restore()
}

export function drawBoss(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette, still: boolean) {
  const boss = state.boss
  if (!boss) return
  if (palette.season === 'halloween') {
    drawJackOLantern(ctx, boss, palette, still)
    drawCracks(ctx, boss, 0, palette, alpha('#2a0e02', 0.85))
    return
  }
  const { x, y } = boss.pos
  const r = boss.radius
  const spin = still ? 0 : boss.age * 0.25
  const speed = Math.hypot(boss.vel.x, boss.vel.y) || 1
  const back = { x: -boss.vel.x / speed, y: -boss.vel.y / speed }

  ctx.save()
  // Fiery trail: a wide cone behind it, fading out.
  const tailLength = r * 3.2
  const tail = ctx.createLinearGradient(x, y, x + back.x * tailLength, y + back.y * tailLength)
  tail.addColorStop(0, alpha(palette.meteor, 0.55))
  tail.addColorStop(0.5, alpha(palette.pink, 0.2))
  tail.addColorStop(1, alpha(palette.pink, 0))
  ctx.fillStyle = tail
  ctx.beginPath()
  ctx.moveTo(x - back.y * r * 0.9, y + back.x * r * 0.9)
  ctx.lineTo(x + back.x * tailLength, y + back.y * tailLength)
  ctx.lineTo(x + back.y * r * 0.9, y - back.x * r * 0.9)
  ctx.closePath()
  ctx.fill()

  // Outer glow.
  const halo = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 1.6)
  halo.addColorStop(0, alpha(palette.meteor, 0.45))
  halo.addColorStop(1, alpha(palette.meteor, 0))
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(x, y, r * 1.6, 0, Math.PI * 2)
  ctx.fill()

  // The rock, lit from the core outward.
  const rock = rockPath(boss, spin)
  const body = ctx.createRadialGradient(x, y, 0, x, y, r)
  body.addColorStop(0, '#fff4d6')
  body.addColorStop(0.18, palette.meteor)
  body.addColorStop(0.45, '#5a2a3c')
  body.addColorStop(1, palette.dark)
  ctx.fillStyle = body
  ctx.shadowColor = palette.meteor
  ctx.shadowBlur = 24
  ctx.fill(rock)
  ctx.shadowBlur = 10
  ctx.strokeStyle = alpha(palette.meteor, 0.9)
  ctx.lineWidth = 2
  ctx.stroke(rock)
  ctx.restore()

  if (boss.flash > 0) {
    ctx.save()
    ctx.globalAlpha = 0.7 * (boss.flash / TUNING.bossFlashSeconds)
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = '#ffffff'
    ctx.shadowBlur = 20
    ctx.fill(rock)
    ctx.restore()
  }
  drawCracks(ctx, boss, spin, palette)
}

// A compact health bar just under the HUD, centered: "BOSS" and one
// segment per point of health.
export function drawBossBar(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette) {
  const boss = state.boss
  if (!boss || state.phase !== 'playing') return
  const small = state.width < 500
  const top = hudHeight(state.width) + 2
  const barWidth = Math.min(small ? 150 : 220, state.width * 0.42)
  const barHeight = small ? 6 : 8
  const label = 'BOSS'
  ctx.save()
  ctx.font = `800 ${small ? 11 : 13}px system-ui, sans-serif`
  const labelWidth = ctx.measureText(label).width
  const gap = 8
  const left = (state.width - (labelWidth + gap + barWidth)) / 2
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = palette.meteor
  ctx.shadowColor = palette.meteor
  ctx.shadowBlur = 6
  ctx.fillText(label, left, top + barHeight / 2)

  const barLeft = left + labelWidth + gap
  const segment = barWidth / boss.maxHealth
  for (let i = 0; i < boss.maxHealth; i++) {
    const lit = i < boss.health
    ctx.fillStyle = lit ? palette.pink : alpha(palette.darkEdge, 0.8)
    ctx.shadowColor = palette.pink
    ctx.shadowBlur = lit ? 6 : 0
    ctx.fillRect(barLeft + i * segment + 1, top, segment - 2, barHeight)
  }
  ctx.shadowBlur = 0
  ctx.strokeStyle = alpha(palette.pink, 0.6)
  ctx.lineWidth = 1
  ctx.strokeRect(barLeft - 1.5, top - 1.5, barWidth + 3, barHeight + 3)
  ctx.restore()
}

const SHAKE_PX = 9

// This frame's screen shake after a boss impact: a decaying jitter, and the
// zoom that keeps the world's edges off screen while it moves (none under
// prefers-reduced-motion).
export function shakeOffset(state: GameState, time: number, still: boolean): { x: number; y: number; zoom: number } {
  if (still || state.shake <= 0) return { x: 0, y: 0, zoom: 1 }
  const strength = SHAKE_PX * (state.shake / TUNING.bossShakeSeconds)
  const zoom = 1 + (2 * SHAKE_PX) / Math.min(state.width, state.height)
  return { x: Math.sin(time * 91) * strength, y: Math.cos(time * 77) * strength, zoom }
}

// A brief orange wash over the sky after a boss impact (shown under
// reduced motion too: it fades, it doesn't move). During Halloween it's
// pumpkin orange; the candle-yellow meteor color would muddy the sky.
export function drawImpactFlash(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette) {
  if (state.shake <= 0) return
  const color = palette.season === 'halloween' ? palette.pink : palette.meteor
  ctx.save()
  ctx.fillStyle = alpha(color, 0.28 * (state.shake / TUNING.bossShakeSeconds))
  ctx.fillRect(0, 0, state.width, state.height)
  ctx.restore()
}
