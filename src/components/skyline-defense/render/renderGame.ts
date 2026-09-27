import type { GameState, Vec } from '../game/types'
import { drawBonusTargets, drawPopups } from './bonus'
import { drawCity, drawDefendedOutlines, type CityLayer } from './city'
import { drawBlasts, drawCrosshair, drawLaunchers, drawProjectiles } from './entities'
import { drawBanner, drawCityStatus, drawHud } from './hud'
import type { Palette } from './palette'
import { drawScene } from './scene'

export type RenderView = {
  palette: Palette
  time: number
  // Hold the grid and stars still (prefers-reduced-motion).
  still: boolean
  highScore: number
  crosshair: Vec | null
  // The skyline image layer, once the image has loaded.
  city: CityLayer | null
}

// Draws one frame. The canvas transform is already scaled for
// devicePixelRatio, so everything here is in world (CSS) pixels.
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, view: RenderView) {
  const fontSize = state.width < 500 ? 13 : 16
  const horizon = view.city ? { y: view.city.y, color: view.city.skyColor } : null
  drawScene(ctx, state, view.palette, view.time, view.still, horizon)
  if (view.city) {
    drawCity(ctx, state, view.city)
    drawDefendedOutlines(ctx, state, view.palette.cyan, view.still)
  }
  drawLaunchers(ctx, state, view.palette, fontSize)
  drawProjectiles(ctx, state, view.palette)
  drawBonusTargets(ctx, state, view.palette, view.still)
  drawBlasts(ctx, state, view.palette, view.still)
  if (state.phase !== 'ready') {
    drawHud(ctx, state, view.palette, view.highScore, fontSize)
    drawCityStatus(ctx, state, view.palette)
  }
  drawBanner(ctx, state, view.palette)
  drawPopups(ctx, state, view.palette, view.still)
  if (view.crosshair && state.phase === 'playing') drawCrosshair(ctx, view.crosshair, view.palette)
}
