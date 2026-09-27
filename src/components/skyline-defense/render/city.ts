import { CITY_BAND, cityView } from '../game/skyline'
import type { Building, GameState } from '../game/types'
import { VISUALS, visualsFor } from './visuals'

// The visible part of the skyline image, pre-rendered at world size, and
// the image's top-row sky color (the game sky blends into it at `y`).
export type CityLayer = {
  canvas: HTMLCanvasElement
  y: number
  width: number
  height: number
  skyColor: string
  key: string
}

export const cityLayerKey = (state: GameState, dpr: number) => `${state.width}x${state.height}@${dpr}`

// Share of the drawn image (from its top) faded into the game's own sky,
// which ends in the image's top-row color, so there's no visible seam. The
// band starts high enough that this stays above the tallest tower.
const FADE = 0.2

// Draws the image's visible crop scaled to the world width with smoothing
// on (like the home page), bottom on the ground line, top faded out, with
// the scenery (everything outside the defended buildings) dimmed.
export function buildCityLayer(image: HTMLImageElement, state: GameState, dpr: number): CityLayer {
  const view = cityView(state.width, state.height)
  const sourceWidth = view.crop.right - view.crop.left
  const sourceHeight = CITY_BAND.bottom - CITY_BAND.top
  const width = state.width
  const height = sourceHeight * view.scale
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  let skyColor = 'rgb(1, 21, 139)'
  if (ctx) {
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, view.crop.left, CITY_BAND.top, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
    skyColor = averageRowColor(ctx, canvas.width, 1)
    // One fill over the whole layer: destination-in clears anything outside
    // what it draws, so the fade and the opaque rest share one gradient.
    const fade = ctx.createLinearGradient(0, 0, 0, canvas.height)
    fade.addColorStop(0, 'rgba(0, 0, 0, 0)')
    fade.addColorStop(FADE, 'rgba(0, 0, 0, 1)')
    fade.addColorStop(1, 'rgba(0, 0, 0, 1)')
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = fade
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = 'source-over'
    dimScenery(ctx, canvas, state, view.groundY - height, dpr)
  }
  return { canvas, y: view.groundY - height, width, height, skyColor, key: cityLayerKey(state, dpr) }
}

// Dims and partly desaturates the whole layer, then puts the original art
// back inside each defended building's outline. Done per pixel (once per
// size) rather than with ctx.filter, which older Safari doesn't support.
function dimScenery(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: GameState, top: number, dpr: number) {
  const original = document.createElement('canvas')
  original.width = canvas.width
  original.height = canvas.height
  original.getContext('2d')?.drawImage(canvas, 0, 0)

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = image.data
  const { sceneryDesaturation, sceneryBrightness } = visualsFor(state.width)
  const keep = 1 - sceneryDesaturation
  const bright = sceneryBrightness
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    for (let c = 0; c < 3; c++) data[i + c] = (gray + (data[i + c] - gray) * keep) * bright
  }
  ctx.putImageData(image, 0, 0)

  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, -top * dpr)
  const defended = new Path2D()
  for (const building of state.buildings) defended.addPath(outlinePath(building))
  ctx.clip(defended)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.drawImage(original, 0, 0)
  ctx.restore()
}

// The average color of one row of the drawn image, as an rgb() string.
function averageRowColor(ctx: CanvasRenderingContext2D, width: number, row: number): string {
  const data = ctx.getImageData(0, row, width, 1).data
  const sum = [0, 0, 0]
  for (let i = 0; i < data.length; i += 4) for (let c = 0; c < 3; c++) sum[c] += data[i + c]
  const [r, g, b] = sum.map((total) => Math.round(total / width))
  return `rgb(${r}, ${g}, ${b})`
}

// Loads the skyline image (usually already cached from the home page) and
// returns the layer for the current size, rebuilding it only when the
// size changes; null until the image has loaded.
export function cityLayerCache(url: string) {
  const image = new Image()
  image.src = url
  let layer: CityLayer | null = null
  return (state: GameState, dpr: number): CityLayer | null => {
    if (!image.complete || image.naturalWidth === 0) return null
    if (layer?.key !== cityLayerKey(state, dpr)) layer = buildCityLayer(image, state, dpr)
    return layer
  }
}

function outlinePath(building: Building): Path2D {
  const path = new Path2D()
  for (const polygon of building.outline) {
    polygon.forEach((point, index) => (index ? path.lineTo(point.x, point.y) : path.moveTo(point.x, point.y)))
    path.closePath()
  }
  return path
}

// The skyline, with each destroyed building's lights out: its outline
// desaturated, then dimmed (visualsFor().destroyedBrightness) so the art stays
// readable but reads darker than the dimmed scenery.
export function drawCity(ctx: CanvasRenderingContext2D, state: GameState, layer: CityLayer) {
  const dim = Math.round(255 * visualsFor(state.width).destroyedBrightness)
  ctx.drawImage(layer.canvas, 0, layer.y, layer.width, layer.height)
  for (const building of state.buildings) {
    if (building.alive) continue
    const left = building.x - building.width / 2
    const top = state.groundY - building.height
    ctx.save()
    ctx.clip(outlinePath(building))
    ctx.globalCompositeOperation = 'saturation'
    ctx.fillStyle = '#808080'
    ctx.fillRect(left, top, building.width, building.height)
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = `rgb(${dim}, ${dim}, ${dim})`
    ctx.fillRect(left, top, building.width, building.height)
    ctx.restore()
  }
}

// Neon outlines around the defended buildings still standing: a pulsing
// reveal that fades out while the "Wave N" title shows (steady under
// reduced motion), and an optional faint edge during play.
export function drawDefendedOutlines(ctx: CanvasRenderingContext2D, state: GameState, color: string, still: boolean) {
  let alpha = 0
  let width = 1
  if (state.phase === 'waveTitle' && state.phaseTime < VISUALS.revealSeconds) {
    const t = state.phaseTime / VISUALS.revealSeconds
    const pulse = 0.65 + 0.35 * Math.cos(state.phaseTime * Math.PI * 2 * VISUALS.revealPulsesPerSecond)
    alpha = still ? 1 : (1 - t) * pulse
    width = VISUALS.revealLineWidth
  } else if (state.phase === 'playing' || state.phase === 'waveTitle') {
    alpha = visualsFor(state.width).defendedEdgeAlpha
  }
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineJoin = 'round'
  ctx.shadowColor = color
  ctx.shadowBlur = width > 1 ? 10 : 4
  for (const building of state.buildings) if (building.alive) ctx.stroke(outlinePath(building))
  ctx.restore()
}
