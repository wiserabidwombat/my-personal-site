import { blastRadius, blastStage } from '../game/geometry'
import { TUNING } from '../game/tuning'
import { LAUNCHER_SIZE } from '../game/skyline'
import type { GameState, Vec } from '../game/types'
import { alpha, type Palette } from './palette'

export function drawLaunchers(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette, fontSize: number) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`
  const half = (LAUNCHER_SIZE.width / 2) * state.scale
  const top = LAUNCHER_SIZE.height * state.scale
  for (const launcher of state.launchers) {
    const color = launcher.ammo > 0 ? palette.cyan : palette.darkEdge
    ctx.save()
    ctx.fillStyle = palette.skyHigh
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.shadowColor = color
    ctx.shadowBlur = launcher.ammo > 0 ? 8 : 0
    ctx.beginPath()
    ctx.moveTo(launcher.x - half, launcher.y)
    ctx.lineTo(launcher.x - half / 2, launcher.y - top)
    ctx.lineTo(launcher.x + half / 2, launcher.y - top)
    ctx.lineTo(launcher.x + half, launcher.y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
    ctx.fillStyle = color
    ctx.fillText(String(launcher.ammo), launcher.x, launcher.y + 6)
  }
}

function trail(ctx: CanvasRenderingContext2D, from: Vec, to: Vec, color: string) {
  const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y)
  gradient.addColorStop(0, alpha(color, 0))
  gradient.addColorStop(1, alpha(color, 0.9))
  ctx.strokeStyle = gradient
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
}

function dot(ctx: CanvasRenderingContext2D, at: Vec, radius: number, fill: string, glow: string) {
  ctx.save()
  ctx.fillStyle = fill
  ctx.shadowColor = glow
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.arc(at.x, at.y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// During Halloween the boss's fragments are pumpkin chunks: orange embers
// with an orange trail, the same 3px as any meteor.
export function drawProjectiles(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette) {
  const halloween = palette.season === 'halloween'
  for (const meteor of state.meteors) {
    const chunk = halloween && meteor.immuneChain !== undefined
    trail(ctx, meteor.start, meteor.pos, chunk || meteor.splitAtY !== null ? palette.pink : palette.meteor)
    dot(ctx, meteor.pos, 3, chunk ? '#ffb070' : '#fff', chunk ? palette.pink : palette.meteor)
  }
  for (const shot of state.interceptors) {
    trail(ctx, shot.from, shot.pos, palette.cyan)
    dot(ctx, shot.pos, 2, '#fff', palette.cyan)
    ctx.strokeStyle = alpha(palette.cyan, 0.8)
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(shot.target.x - 5, shot.target.y - 5)
    ctx.lineTo(shot.target.x + 5, shot.target.y + 5)
    ctx.moveTo(shot.target.x + 5, shot.target.y - 5)
    ctx.lineTo(shot.target.x - 5, shot.target.y + 5)
    ctx.stroke()
  }
}

// How bright a blast is drawn: full while growing; a quick flicker while
// holding, so it reads as still dangerous (steady under reduced motion);
// fading with its radius while it shrinks.
function blastIntensity(age: number, stage: ReturnType<typeof blastStage>, still: boolean): number {
  if (stage === 'hold') return still ? 1 : 0.88 + 0.12 * Math.sin((age - TUNING.blastGrow) * Math.PI * 2 * 7)
  if (stage === 'shrink') return 1 - (age - TUNING.blastGrow - TUNING.blastHold) / TUNING.blastShrink
  return 1
}

export function drawBlasts(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette, still: boolean) {
  for (const blast of state.blasts) {
    const radius = blastRadius(blast)
    if (radius <= 0) continue
    const intensity = blastIntensity(blast.age, blastStage(blast), still)
    const color =
      blast.kind === 'interceptor'
        ? palette.cyan
        : blast.kind === 'chain'
          ? palette.pink
          : blast.kind === 'bonus'
            ? palette.lime
            : palette.meteor
    const gradient = ctx.createRadialGradient(blast.pos.x, blast.pos.y, 0, blast.pos.x, blast.pos.y, radius)
    gradient.addColorStop(0, alpha('#ffffff', 0.9 * intensity))
    gradient.addColorStop(0.35, alpha(color, 0.7 * intensity))
    gradient.addColorStop(1, alpha(color, 0))
    ctx.save()
    ctx.fillStyle = gradient
    ctx.shadowColor = color
    ctx.shadowBlur = 18 * intensity
    ctx.beginPath()
    ctx.arc(blast.pos.x, blast.pos.y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = alpha(color, 0.85 * intensity)
    // The ring thickens with the hold pulse, so a lingering blast still
    // reads as live.
    ctx.lineWidth = 1.5 + Math.max(0, intensity - 0.88) * 12
    ctx.stroke()
    ctx.restore()
  }
}

export function drawCrosshair(ctx: CanvasRenderingContext2D, at: Vec, palette: Palette) {
  ctx.strokeStyle = palette.cyan
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(at.x, at.y, 9, 0, Math.PI * 2)
  ctx.moveTo(at.x - 14, at.y)
  ctx.lineTo(at.x - 4, at.y)
  ctx.moveTo(at.x + 4, at.y)
  ctx.lineTo(at.x + 14, at.y)
  ctx.moveTo(at.x, at.y - 14)
  ctx.lineTo(at.x, at.y - 4)
  ctx.moveTo(at.x, at.y + 4)
  ctx.lineTo(at.x, at.y + 14)
  ctx.stroke()
}
