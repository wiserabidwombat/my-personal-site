// Pixel-art sprites on the canvas, in the same row-string format as the
// site's Halloween sprites (src/components/halloween/PixelSprite.tsx): one
// string per row, one character per pixel, '.' transparent.

export type PixelRows = readonly string[]

// The farthest corner of any filled pixel from the sprite's center, in
// pixels. A sprite drawn at `radius / farthestCorner(rows)` pixels per cell
// fits entirely inside a circle of that radius around its center.
export function farthestCorner(rows: PixelRows): number {
  const width = Math.max(...rows.map((row) => row.length))
  const cx = width / 2
  const cy = rows.length / 2
  let far = 0
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '.') continue
      for (const [dx, dy] of [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]) {
        far = Math.max(far, Math.hypot(x + dx - cx, y + dy - cy))
      }
    }
  })
  return far
}

// Draws `rows` centered on (x, y) at `pixel` canvas pixels per cell,
// mirrored left-to-right when `flip` is set. Each color is one path of
// rects filled once, so neighboring pixels never show seams between them.
// Characters missing from `colors` are skipped.
export function drawPixelArt(
  ctx: CanvasRenderingContext2D,
  rows: PixelRows,
  colors: Record<string, string>,
  x: number,
  y: number,
  pixel: number,
  flip = false,
) {
  const width = Math.max(...rows.map((row) => row.length))
  const left = x - (width * pixel) / 2
  const top = y - (rows.length * pixel) / 2
  for (const [char, color] of Object.entries(colors)) {
    ctx.beginPath()
    rows.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) {
        if (row[rx] !== char) continue
        const column = flip ? width - 1 - rx : rx
        ctx.rect(left + column * pixel, top + ry * pixel, pixel, pixel)
      }
    })
    ctx.fillStyle = color
    ctx.fill()
  }
}
