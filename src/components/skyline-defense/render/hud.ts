import type { GameState } from '../game/types'
import type { Palette } from './palette'

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, align: CanvasTextAlign, color: string) {
  ctx.textAlign = align
  ctx.fillStyle = color
  ctx.fillText(value, x, y)
}

// Height of the HUD row along the top edge; the crosshair stays below it.
export const HUD_HEIGHT = 36

// Score, wave, and high score along the top edge.
export function drawHud(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette, highScore: number, fontSize: number) {
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`
  ctx.textBaseline = 'top'
  const y = 12
  text(ctx, `SCORE ${state.score}`, 14, y, 'left', palette.pink)
  if (state.wave > 0) text(ctx, `WAVE ${state.wave}`, state.width / 2, y, 'center', palette.cyan)
  text(ctx, `HI ${Math.max(highScore, state.score)}`, state.width - 14, y, 'right', palette.text)
}

// "Wave N" title before a wave, and the bonus tally after one.
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
  }
  ctx.restore()
}
