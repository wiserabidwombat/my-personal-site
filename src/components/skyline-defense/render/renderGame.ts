import type { GameState, Vec } from '../game/types'
import { drawBuildings } from './buildings'
import { drawBlasts, drawCrosshair, drawLaunchers, drawProjectiles } from './entities'
import { drawBanner, drawHud } from './hud'
import type { Palette } from './palette'
import { drawScene } from './scene'

export type RenderView = {
  palette: Palette
  time: number
  // Hold the grid and stars still (prefers-reduced-motion).
  still: boolean
  highScore: number
  crosshair: Vec | null
}

// Draws one frame. The canvas transform is already scaled for
// devicePixelRatio, so everything here is in world (CSS) pixels.
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, view: RenderView) {
  const fontSize = state.width < 500 ? 13 : 16
  drawScene(ctx, state, view.palette, view.time, view.still)
  drawBuildings(ctx, state, view.palette)
  drawLaunchers(ctx, state, view.palette, fontSize)
  drawProjectiles(ctx, state, view.palette)
  drawBlasts(ctx, state, view.palette)
  if (state.phase !== 'ready') drawHud(ctx, state, view.palette, view.highScore, fontSize)
  drawBanner(ctx, state, view.palette)
  if (view.crosshair && state.phase === 'playing') drawCrosshair(ctx, view.crosshair, view.palette)
}
