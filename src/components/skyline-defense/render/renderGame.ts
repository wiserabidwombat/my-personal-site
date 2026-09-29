import type { GameState, Vec } from '../game/types'
import { drawBonusTargets, drawPopups } from './bonus'
import { drawBoss, drawBossBar, drawImpactFlash, shakeOffset } from './boss'
import { drawCity, drawDefendedOutlines, type CityLayer } from './city'
import { drawBlasts, drawCrosshair, drawLaunchers, drawProjectiles } from './entities'
import { drawBanner, drawCityStatus, drawHud, drawTestTag } from './hud'
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
  // The starting wave of a dev-only test run (?wave=N), or null.
  testWave: number | null
}

// Draws one frame. The canvas transform is already scaled for
// devicePixelRatio, so everything here is in world (CSS) pixels. After a
// boss impact the world (not the HUD) shakes briefly.
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, view: RenderView) {
  const fontSize = state.width < 500 ? 13 : 16
  const horizon = view.city ? { y: view.city.y, color: view.city.skyColor } : null
  const shake = shakeOffset(state, view.time, view.still)
  ctx.save()
  if (shake.zoom !== 1) {
    // Zoomed in just enough that the shaken world still covers the canvas.
    ctx.translate(state.width / 2 + shake.x, state.height / 2 + shake.y)
    ctx.scale(shake.zoom, shake.zoom)
    ctx.translate(-state.width / 2, -state.height / 2)
  }
  drawScene(ctx, state, view.palette, view.time, view.still, horizon)
  if (view.city) {
    drawCity(ctx, state, view.city)
    drawDefendedOutlines(ctx, state, view.palette.cyan, view.still)
  }
  drawLaunchers(ctx, state, view.palette, fontSize)
  drawProjectiles(ctx, state, view.palette)
  drawBoss(ctx, state, view.palette, view.still)
  drawBonusTargets(ctx, state, view.palette, view.still)
  drawBlasts(ctx, state, view.palette, view.still)
  ctx.restore()
  drawImpactFlash(ctx, state, view.palette)
  if (state.phase !== 'ready') {
    drawHud(ctx, state, view.palette, view.highScore, fontSize)
    drawCityStatus(ctx, state, view.palette)
    drawBossBar(ctx, state, view.palette)
    if (import.meta.env.DEV && view.testWave !== null) drawTestTag(ctx, view.testWave, view.palette)
  }
  drawBanner(ctx, state, view.palette)
  drawPopups(ctx, state, view.palette, view.still)
  if (view.crosshair && state.phase === 'playing') drawCrosshair(ctx, view.crosshair, view.palette)
}
