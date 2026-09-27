import { CITY_BAND, cityView } from '../game/skyline'
import type { Building, GameState } from '../game/types'

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
// on (like the home page), bottom on the ground line, top faded out.
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
  }
  return { canvas, y: view.groundY - height, width, height, skyColor, key: cityLayerKey(state, dpr) }
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
// desaturated, then dimmed to ~45% brightness so the art stays readable.
export function drawCity(ctx: CanvasRenderingContext2D, state: GameState, layer: CityLayer) {
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
    ctx.fillStyle = 'rgb(118, 110, 135)'
    ctx.fillRect(left, top, building.width, building.height)
    ctx.restore()
  }
}
