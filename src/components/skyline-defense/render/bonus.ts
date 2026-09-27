import { popupShownY } from '../game/chains'
import { TUNING } from '../game/tuning'
import type { GameState, Scout, Ufo } from '../game/types'
import { alpha, type Palette } from './palette'

// Bonus targets are magenta and lime -- never the cyan of the defended
// buildings' outlines -- so they can't be mistaken for something you're
// defending, and stay bright against the dimmed skyline.

function drawUfo(ctx: CanvasRenderingContext2D, ufo: Ufo, palette: Palette, still: boolean) {
  const { x, y } = ufo.pos
  const s = ufo.size
  ctx.save()
  ctx.shadowColor = palette.pink
  ctx.shadowBlur = 12

  // Glass dome.
  ctx.beginPath()
  ctx.ellipse(x, y - s * 0.08, s * 0.22, s * 0.2, 0, Math.PI, 0)
  ctx.fillStyle = alpha(palette.lime, 0.35)
  ctx.fill()
  ctx.strokeStyle = palette.lime
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Saucer body.
  const body = ctx.createLinearGradient(x, y - s * 0.16, x, y + s * 0.16)
  body.addColorStop(0, palette.pink)
  body.addColorStop(1, alpha(palette.pink, 0.45))
  ctx.beginPath()
  ctx.ellipse(x, y, s / 2, s * 0.15, 0, 0, Math.PI * 2)
  ctx.fillStyle = body
  ctx.fill()
  ctx.strokeStyle = alpha('#ffffff', 0.7)
  ctx.lineWidth = 1
  ctx.stroke()

  // Running lights: one bright light chases along the rim (steady under
  // reduced motion).
  ctx.shadowColor = palette.lime
  ctx.shadowBlur = 6
  const lights = 5
  const lit = Math.floor(ufo.age * 8) % lights
  for (let i = 0; i < lights; i++) {
    const lx = x + (i - (lights - 1) / 2) * s * 0.17
    ctx.fillStyle = still || i === lit ? palette.lime : alpha(palette.lime, 0.4)
    ctx.beginPath()
    ctx.arc(lx, y + s * 0.02, Math.max(1.5, s * 0.035), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawScout(ctx: CanvasRenderingContext2D, scout: Scout, palette: Palette, still: boolean) {
  const { x, y } = scout.pos
  const s = scout.size
  const armsUp = !still && Math.floor(scout.age * 5 + scout.phase) % 2 === 1
  ctx.save()
  ctx.shadowColor = palette.lime
  ctx.shadowBlur = 6
  ctx.strokeStyle = palette.lime
  ctx.fillStyle = palette.lime
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  // Antennae with magenta tips.
  ctx.beginPath()
  ctx.moveTo(x - s * 0.12, y - s * 0.3)
  ctx.lineTo(x - s * 0.22, y - s * 0.5)
  ctx.moveTo(x + s * 0.12, y - s * 0.3)
  ctx.lineTo(x + s * 0.22, y - s * 0.5)
  ctx.stroke()
  // Arms, flapping between two frames.
  const armY = armsUp ? y - s * 0.3 : y + s * 0.2
  ctx.beginPath()
  ctx.moveTo(x - s * 0.25, y)
  ctx.lineTo(x - s * 0.45, armY)
  ctx.moveTo(x + s * 0.25, y)
  ctx.lineTo(x + s * 0.45, armY)
  ctx.stroke()
  // Head/body.
  ctx.beginPath()
  ctx.ellipse(x, y - s * 0.02, s * 0.28, s * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.fillStyle = palette.pink
  for (const [ex, ey, r] of [
    [-0.22, -0.5, 0.07],
    [0.22, -0.5, 0.07],
    [-0.1, -0.08, 0.08],
    [0.1, -0.08, 0.08],
  ]) {
    ctx.beginPath()
    ctx.arc(x + ex * s, y + ey * s, Math.max(1.2, r * s), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

export function drawBonusTargets(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette, still: boolean) {
  for (const scout of state.scouts) drawScout(ctx, scout, palette, still)
  for (const ufo of state.ufos) drawUfo(ctx, ufo, palette, still)
}

// "+points" (white for meteors, lime for bonus targets) rising and fading,
// and a chain's one "CHAIN xN  +total" (magenta), held in place with a quick
// scale pop on each update. Under reduced motion nothing rises or pops.
// Popups are already placed below the HUD and apart (see addPopup).
export function drawPopups(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette, still: boolean) {
  const small = state.width < 500
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const popup of state.popups) {
    const t = popup.age / TUNING.popupSeconds
    const chain = popup.kind === 'chain'
    const y = still ? popup.pos.y : popupShownY(popup)
    const pop = chain && !still ? 1 + 0.35 * Math.max(0, 1 - popup.age / TUNING.popupPopSeconds) : 1
    ctx.globalAlpha = Math.max(0, 1 - t * t)
    ctx.font = `${chain ? 800 : 700} ${((small ? 12 : 14) + (chain ? 1 : 0)) * pop}px system-ui, sans-serif`
    const color = chain ? palette.pink : popup.kind === 'bonus' ? palette.lime : palette.text
    // A thin dark outline keeps the text readable over any blast color.
    ctx.shadowBlur = 0
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.strokeStyle = alpha(palette.sky, 0.85)
    ctx.strokeText(popup.text, popup.pos.x, y)
    ctx.shadowColor = color
    ctx.shadowBlur = 6
    ctx.fillStyle = color
    ctx.fillText(popup.text, popup.pos.x, y)
  }
  ctx.restore()
}
