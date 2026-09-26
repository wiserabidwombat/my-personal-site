import { cn } from 'cn'

export type SpriteArt = {
  // One string per row, one character per pixel; '.' is transparent.
  rows: string[]
  // Fill color for each character used in `rows`.
  colors: Record<string, string>
  // Optional 1px outline drawn around every filled pixel, so pale sprites
  // (a ghost, a skeleton) stay visible on the light background too.
  outline?: string
}

type Props = {
  art: SpriteArt
  className?: string
}

// An 8-bit sprite as an inline SVG: one crisp-edged rect per pixel, scaled
// by the SVG's CSS size. Always decorative (aria-hidden).
export function PixelSprite({ art, className }: Props) {
  const { rows, colors, outline } = art
  const pad = outline ? 1 : 0
  const width = Math.max(...rows.map((row) => row.length)) + pad * 2
  const height = rows.length + pad * 2
  const filled: [number, number, string][] = []
  rows.forEach((row, y) =>
    [...row].forEach((char, x) => {
      if (char !== '.' && colors[char]) filled.push([x + pad, y + pad, colors[char]])
    }),
  )

  // Outline: every empty neighbor (4-way) of a filled pixel.
  const outlinePixels = new Set<string>()
  if (outline) {
    const isFilled = new Set(filled.map(([x, y]) => `${x},${y}`))
    for (const [x, y] of filled) {
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const key = `${x + dx},${y + dy}`
        if (!isFilled.has(key)) outlinePixels.add(key)
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('block', className)}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {[...outlinePixels].map((key) => {
        const [x, y] = key.split(',').map(Number)
        return <rect key={`o${key}`} x={x} y={y} width={1} height={1} fill={outline} />
      })}
      {filled.map(([x, y, fill]) => (
        <rect key={`${x},${y}`} x={x} y={y} width={1} height={1} fill={fill} />
      ))}
    </svg>
  )
}
