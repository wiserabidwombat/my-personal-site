import { TUNING } from './game/tuning'
import type { GameState, Vec } from './game/types'
import { hudHeight } from './render/hud'

// Keeps the crosshair inside the sky: below the HUD row (its arms reach
// 14px) and above the ground.
export function placeCrosshair(point: Vec, game: GameState): Vec {
  return {
    x: Math.min(Math.max(point.x, 0), game.width),
    y: Math.min(Math.max(point.y, hudHeight(game.width) + 14), game.groundY - 12),
  }
}

// Moves the crosshair for the arrow keys held this frame, starting from the
// middle of the sky if it isn't showing yet (touch screens before a tap).
export function steerCrosshair(crosshair: Vec | null, heldKeys: Set<string>, game: GameState, dt: number): Vec | null {
  if (heldKeys.size === 0) return crosshair
  const from = crosshair ?? { x: game.width / 2, y: game.height * 0.4 }
  const dx = Number(heldKeys.has('ArrowRight')) - Number(heldKeys.has('ArrowLeft'))
  const dy = Number(heldKeys.has('ArrowDown')) - Number(heldKeys.has('ArrowUp'))
  const step = TUNING.crosshairSpeed * dt
  return placeCrosshair({ x: from.x + dx * step, y: from.y + dy * step }, game)
}
