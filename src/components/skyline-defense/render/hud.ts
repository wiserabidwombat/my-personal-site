import { isBossWave } from '../game/bossStats'
import type { GameState } from '../game/types'
import { alpha, type Palette } from './palette'
import { VISUALS, visualsFor } from './visuals'
import { formatScore } from '../formatScore'

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, align: CanvasTextAlign, color: string) {
  ctx.textAlign = align
  ctx.fillStyle = color
  ctx.fillText(value, x, y)
}

const STATUS_TOP = 32

// Height of the HUD (score row plus the city status icons below it, which
// are larger on wide screens); the crosshair stays below it.
export function hudHeight(width: number): number {
  return STATUS_TOP + VISUALS.statusIconHeight * visualsFor(width).statusIconScale + 4
}

// Score, wave, and high score along the top edge.
export function drawHud(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette, highScore: number, fontSize: number) {
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`
  ctx.textBaseline = 'top'
  const y = 12
  text(ctx, `SCORE ${formatScore(state.score)}`, 14, y, 'left', palette.pink)
  if (state.wave > 0) text(ctx, `WAVE ${state.wave}`, state.width / 2, y, 'center', palette.cyan)
  text(ctx, `HI ${formatScore(Math.max(highScore, state.score))}`, state.width - 14, y, 'right', palette.text)
}

// "TEST: WAVE N" under the score on dev-only test runs (?wave=N), so a
// screenshot can't pass for a real run: small, left of the centered city
// status icons, above the boss bar.
export function drawTestTag(ctx: CanvasRenderingContext2D, testWave: number, palette: Palette) {
  const label = `TEST: WAVE ${testWave}`
  ctx.save()
  ctx.font = '700 10px system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  const width = ctx.measureText(label).width + 10
  const top = STATUS_TOP + 2
  ctx.fillStyle = alpha(palette.sky, 0.7)
  ctx.fillRect(14, top, width, 16)
  ctx.strokeStyle = alpha(palette.lime, 0.7)
  ctx.lineWidth = 1
  ctx.strokeRect(14.5, top + 0.5, width - 1, 15)
  ctx.fillStyle = palette.lime
  ctx.fillText(label, 19, top + 8.5)
  ctx.restore()
}

// City status: one small silhouette per defended building, left to right as
// on screen, centered under the score row. Heights share one scale (so
// their relative sizes match); thin towers are widened to a minimum width
// so each icon stays legible. Lit buildings are cyan; destroyed ones go dark.
export function drawCityStatus(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette) {
  const buildings = [...state.buildings].sort((a, b) => a.x - b.x)
  if (buildings.length === 0) return
  const size = visualsFor(state.width).statusIconScale
  const iconHeight = VISUALS.statusIconHeight * size
  const scale = iconHeight / Math.max(...buildings.map((b) => b.height))
  const iconWidth = (b: (typeof buildings)[number]) => Math.max(b.width * scale, VISUALS.statusIconMinWidth * size)
  const gap = VISUALS.statusIconGap * size
  const total = buildings.reduce((sum, b) => sum + iconWidth(b), 0) + gap * (buildings.length - 1)
  let left = (state.width - total) / 2
  const base = STATUS_TOP + iconHeight
  ctx.save()
  for (const building of buildings) {
    const x0 = building.x - building.width / 2
    const xScale = iconWidth(building) / building.width
    const path = new Path2D()
    for (const polygon of building.outline) {
      polygon.forEach((p, i) => {
        const x = left + (p.x - x0) * xScale
        const y = base - (state.groundY - p.y) * scale
        if (i) path.lineTo(x, y)
        else path.moveTo(x, y)
      })
      path.closePath()
    }
    ctx.fillStyle = building.alive ? palette.cyan : palette.darkEdge
    ctx.shadowColor = palette.cyan
    ctx.shadowBlur = building.alive ? 4 : 0
    ctx.fill(path)
    left += iconWidth(building) + gap
  }
  ctx.restore()
}

// "Wave N" title before a wave (with "BOSS WAVE" under it on a boss wave),
// and the bonus tally after one.
export function drawBanner(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette) {
  const size = Math.min(56, state.width * 0.11)
  const y = state.height * 0.3
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowBlur = 16
  if (state.phase === 'waveTitle') {
    ctx.shadowColor = palette.pink
    ctx.fillStyle = palette.pink
    ctx.font = `800 ${size}px system-ui, sans-serif`
    ctx.fillText(`WAVE ${state.wave}`, state.width / 2, y)
    if (isBossWave(state.wave)) {
      ctx.shadowColor = palette.meteor
      ctx.fillStyle = palette.meteor
      ctx.font = `800 ${size * 0.55}px system-ui, sans-serif`
      ctx.fillText('BOSS WAVE', state.width / 2, y + size * 0.95)
    }
  }
  if (state.phase === 'waveBonus' && state.lastBonus) {
    const small = Math.max(14, size * 0.36)
    ctx.shadowColor = palette.cyan
    ctx.fillStyle = palette.cyan
    ctx.font = `800 ${size * 0.7}px system-ui, sans-serif`
    ctx.fillText(`WAVE ${state.wave} CLEAR`, state.width / 2, y)
    ctx.shadowBlur = 0
    ctx.fillStyle = palette.text
    ctx.font = `600 ${small}px system-ui, sans-serif`
    ctx.fillText(`City bonus +${state.lastBonus.buildings}`, state.width / 2, y + size * 0.8)
    ctx.fillText(`Ammo bonus +${state.lastBonus.ammo}`, state.width / 2, y + size * 0.8 + small * 1.5)
    if (state.lastBonus.boss > 0) {
      ctx.fillStyle = palette.meteor
      ctx.fillText(`Boss bonus +${state.lastBonus.boss}`, state.width / 2, y + size * 0.8 + small * 3)
    }
  }
  ctx.restore()
}
