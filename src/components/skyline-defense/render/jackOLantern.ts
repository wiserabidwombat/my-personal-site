import { TUNING } from '../game/tuning'
import type { Boss } from '../game/types'
import { alpha, type Palette } from './palette'

// The boss during Halloween: a giant flaming jack-o'-lantern with the same
// size and position as the normal boss (drawing only; the hitbox is the
// same circle either way). As it takes damage its carved face burns
// brighter; cracks are drawn over it by the caller, after the hit flash,
// so the flash never hides them.

const RIND_DARK = '#8a3a06'
const RIND_LIGHT = '#ff8c2a'
const STEM = '#4f7a24'
const CANDLE = '#ffe9a8'

// The pumpkin's silhouette, for the body, the flash, and clipping.
export function pumpkinPath(x: number, y: number, r: number): Path2D {
  const path = new Path2D()
  path.ellipse(x, y, r, r * 0.86, 0, 0, Math.PI * 2)
  return path
}

// Flame tongues streaming behind it, flickering (steady under reduced
// motion).
function drawFlames(ctx: CanvasRenderingContext2D, boss: Boss, palette: Palette, still: boolean) {
  const { x, y } = boss.pos
  const r = boss.radius
  const speed = Math.hypot(boss.vel.x, boss.vel.y) || 1
  const back = { x: -boss.vel.x / speed, y: -boss.vel.y / speed }
  const side = { x: -back.y, y: back.x }
  for (let i = 0; i < 5; i++) {
    const offset = (i - 2) * 0.38 * r
    const flicker = still ? 1 : 0.8 + 0.25 * Math.sin(boss.age * 11 + i * 1.7)
    const length = r * (2.2 + (2 - Math.abs(i - 2)) * 0.6) * flicker
    const base = { x: x + side.x * offset + back.x * r * 0.4, y: y + side.y * offset + back.y * r * 0.4 }
    const tip = { x: base.x + back.x * length, y: base.y + back.y * length }
    const gradient = ctx.createLinearGradient(base.x, base.y, tip.x, tip.y)
    gradient.addColorStop(0, alpha(palette.meteor, 0.75))
    gradient.addColorStop(0.45, alpha(palette.pink, 0.45))
    gradient.addColorStop(1, alpha(palette.pink, 0))
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(base.x + side.x * r * 0.25, base.y + side.y * r * 0.25)
    ctx.quadraticCurveTo(tip.x + side.x * r * 0.3, tip.y + side.y * r * 0.3, tip.x, tip.y)
    ctx.quadraticCurveTo(tip.x - side.x * r * 0.3, tip.y - side.y * r * 0.3, base.x - side.x * r * 0.25, base.y - side.y * r * 0.25)
    ctx.closePath()
    ctx.fill()
  }
}

// Ribbed body (overlapping lobes, darker toward the edge) and a stem.
function drawBody(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, palette: Palette) {
  ctx.save()
  ctx.shadowColor = palette.pink
  ctx.shadowBlur = 26
  const body = ctx.createRadialGradient(x - r * 0.2, y - r * 0.25, r * 0.1, x, y, r)
  body.addColorStop(0, RIND_LIGHT)
  body.addColorStop(1, RIND_DARK)
  ctx.fillStyle = body
  ctx.fill(pumpkinPath(x, y, r))
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = alpha(RIND_DARK, 0.9)
  ctx.lineWidth = Math.max(1.5, r * 0.04)
  for (const lobe of [0.35, 0.7]) {
    ctx.beginPath()
    ctx.ellipse(x, y, r * lobe, r * 0.84, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.fillStyle = STEM
  ctx.beginPath()
  ctx.moveTo(x - r * 0.1, y - r * 0.78)
  ctx.lineTo(x - r * 0.06, y - r * 1.08)
  ctx.lineTo(x + r * 0.14, y - r * 1.14)
  ctx.lineTo(x + r * 0.1, y - r * 0.78)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// Carved eyes, nose, and a jagged grin, lit from inside: dim at full
// health, blazing near the end. Flickers like a candle unless motion is
// reduced.
function drawFace(ctx: CanvasRenderingContext2D, boss: Boss, x: number, y: number, r: number, palette: Palette, still: boolean) {
  const damage = 1 - boss.health / boss.maxHealth
  const flicker = still ? 0 : 0.08 * Math.sin(boss.age * 17) + 0.05 * Math.sin(boss.age * 29)
  const glow = Math.min(1, 0.45 + 0.55 * damage + flicker)
  const face = new Path2D()
  for (const side of [-1, 1]) {
    face.moveTo(x + side * r * 0.18, y - r * 0.12)
    face.lineTo(x + side * r * 0.5, y - r * 0.12)
    face.lineTo(x + side * r * 0.32, y - r * 0.45)
    face.closePath()
  }
  face.moveTo(x - r * 0.08, y + r * 0.08)
  face.lineTo(x + r * 0.08, y + r * 0.08)
  face.lineTo(x, y - r * 0.06)
  face.closePath()
  const teeth = 6
  face.moveTo(x - r * 0.6, y + r * 0.2)
  for (let i = 0; i <= teeth; i++) {
    const tx = x - r * 0.6 + (i / teeth) * r * 1.2
    face.lineTo(tx, y + r * (i % 2 ? 0.34 : 0.22))
  }
  face.quadraticCurveTo(x, y + r * 0.85, x - r * 0.6, y + r * 0.2)
  face.closePath()

  ctx.save()
  ctx.fillStyle = alpha(CANDLE, 0.55 + 0.45 * glow)
  ctx.shadowColor = palette.meteor
  ctx.shadowBlur = 10 + 26 * glow
  ctx.fill(face)
  ctx.fillStyle = alpha('#ffffff', 0.5 * damage)
  ctx.fill(face)
  ctx.restore()
}

export function drawJackOLantern(ctx: CanvasRenderingContext2D, boss: Boss, palette: Palette, still: boolean) {
  const { x, y } = boss.pos
  const r = boss.radius
  ctx.save()
  drawFlames(ctx, boss, palette, still)
  const halo = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 1.7)
  halo.addColorStop(0, alpha(palette.pink, 0.4))
  halo.addColorStop(1, alpha(palette.pink, 0))
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(x, y, r * 1.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  drawBody(ctx, x, y, r, palette)
  if (boss.flash > 0) {
    ctx.save()
    ctx.globalAlpha = 0.7 * (boss.flash / TUNING.bossFlashSeconds)
    ctx.fillStyle = '#ffffff'
    ctx.fill(pumpkinPath(x, y, r))
    ctx.restore()
  }
  drawFace(ctx, boss, x, y, r, palette, still)
}
