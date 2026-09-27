import type { GameState } from '../game/types'
import { alpha, noise, type Palette } from './palette'

// Night sky, stars, a pink glow on the horizon, and the perspective floor
// grid below the ground line. `time` scrolls the grid unless motion is
// reduced.
export function drawScene(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette, time: number, still: boolean) {
  const { width, height, groundY } = state

  const sky = ctx.createLinearGradient(0, 0, 0, groundY)
  sky.addColorStop(0, palette.sky)
  sky.addColorStop(0.6, palette.skyHigh)
  sky.addColorStop(1, alpha(palette.pink, 0.16))
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, groundY)

  const starCount = Math.round((width * groundY) / 5000)
  for (let i = 0; i < starCount; i++) {
    const twinkle = still ? 0.7 : 0.45 + 0.4 * Math.sin(time * 1.5 + i)
    ctx.fillStyle = alpha(palette.text, twinkle * (0.4 + noise(i * 3 + 2) * 0.6))
    ctx.fillRect(noise(i * 3) * width, noise(i * 3 + 1) * groundY * 0.75, 1.5, 1.5)
  }

  // Drawn over the whole sky (the gradient fades out on its own), so it
  // never shows a hard edge.
  const glow = ctx.createRadialGradient(width / 2, groundY, 0, width / 2, groundY, Math.max(width * 0.6, groundY))
  glow.addColorStop(0, alpha(palette.pink, 0.3))
  glow.addColorStop(1, alpha(palette.pink, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, groundY)

  ctx.fillStyle = palette.sky
  ctx.fillRect(0, groundY, width, height - groundY)
  drawFloorGrid(ctx, state, palette, still ? 0 : (time * 0.5) % 1)

  ctx.strokeStyle = alpha(palette.pink, 0.9)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(width, groundY)
  ctx.stroke()
}

function drawFloorGrid(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette, scroll: number) {
  const { width, height, groundY } = state
  const depth = height - groundY
  const center = width / 2
  const spacing = 60
  ctx.strokeStyle = alpha(palette.cyan, 0.45)
  ctx.lineWidth = 1
  ctx.beginPath()
  const columns = Math.ceil(width / spacing) + 2
  for (let i = -columns; i <= columns; i++) {
    ctx.moveTo(center + i * spacing * 0.3, groundY)
    ctx.lineTo(center + i * spacing * 1.6, height)
  }
  const rows = 7
  for (let k = 0; k < rows; k++) {
    const y = groundY + depth * ((k + scroll) / rows) ** 2
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
  }
  ctx.stroke()
}
