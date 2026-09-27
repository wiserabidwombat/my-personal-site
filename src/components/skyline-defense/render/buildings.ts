import type { Building, GameState } from '../game/types'
import { alpha, noise, type Palette } from './palette'

type Box = { left: number; right: number; top: number; base: number; width: number; height: number }

// Outline of each landmark, traced inside its hit box.
function outline(kind: Building['kind'], box: Box): Path2D {
  const { left, right, top, base, width, height } = box
  const mid = (left + right) / 2
  const path = new Path2D()
  const polygon = (points: [number, number][]) => {
    path.moveTo(...points[0])
    for (const point of points.slice(1)) path.lineTo(...point)
    path.closePath()
  }
  switch (kind) {
    case 'reunion': {
      const radius = width / 2
      const shaft = width * 0.3
      path.arc(mid, top + radius, radius, 0, Math.PI * 2)
      path.rect(mid - shaft / 2, top + radius * 1.8, shaft, base - top - radius * 1.8)
      break
    }
    case 'fountain':
      polygon([[left, base], [left, top + height * 0.2], [left + width * 0.55, top], [right, top + height * 0.34], [right, base]])
      break
    case 'comerica':
      polygon([[left, base], [left, top + height * 0.12], [mid, top], [right, top + height * 0.12], [right, base]])
      break
    case 'renaissance':
      polygon([
        [left, base], [left, top + height * 0.1], [left + width * 0.2, top], [left + width * 0.3, top + height * 0.1],
        [right - width * 0.3, top + height * 0.1], [right - width * 0.2, top], [right, top + height * 0.1], [right, base],
      ])
      break
    default:
      path.rect(left, top, width, height)
  }
  return path
}

const outlineColor = (building: Building, palette: Palette) =>
  ({ reunion: palette.pink, bofa: palette.bofaGreen, fountain: palette.cyan, comerica: palette.pink, renaissance: palette.cyan, generic: palette.purple })[building.kind]

function drawWindows(ctx: CanvasRenderingContext2D, building: Building, box: Box, palette: Palette) {
  if (building.kind === 'reunion') {
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2
      ctx.fillStyle = i % 2 ? palette.pink : '#fff4c2'
      ctx.fillRect(box.left + box.width / 2 + Math.cos(angle) * box.width * 0.3 - 1, box.top + box.width / 2 + Math.sin(angle) * box.width * 0.3 - 1, 2, 2)
    }
    return
  }
  const size = 2
  for (let y = box.top + box.height * 0.2; y < box.base - 6; y += 8) {
    for (let x = box.left + 4; x < box.right - 4; x += 6) {
      const n = noise(building.id * 1000 + Math.round(x) * 7 + Math.round(y))
      if (n < 0.45) continue
      ctx.fillStyle = alpha(n > 0.8 ? palette.pink : palette.cyan, 0.55)
      ctx.fillRect(x, y, size, size)
    }
  }
}

export function drawBuildings(ctx: CanvasRenderingContext2D, state: GameState, palette: Palette) {
  for (const building of state.buildings) {
    const box: Box = {
      left: building.x - building.width / 2,
      right: building.x + building.width / 2,
      top: state.groundY - building.height,
      base: state.groundY,
      width: building.width,
      height: building.height,
    }
    const path = outline(building.kind, box)
    const color = outlineColor(building, palette)
    ctx.save()
    ctx.fillStyle = building.alive ? palette.skyHigh : palette.dark
    ctx.fill(path)
    if (building.alive) {
      ctx.save()
      ctx.clip(path)
      drawWindows(ctx, building, box, palette)
      ctx.restore()
      ctx.shadowColor = color
      ctx.shadowBlur = 10
    }
    ctx.strokeStyle = building.alive ? color : palette.darkEdge
    ctx.lineWidth = building.kind === 'bofa' ? 2 : 1.5
    ctx.stroke(path)
    ctx.restore()
  }
}
