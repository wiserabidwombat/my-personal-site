// Regenerates the Projects page images (src/assets/projects/) from full-size
// PNG masters, in one command: `npm run images:projects`.
//
// The masters (pomodoro-*.png) are raw app screenshots and are gitignored
// (`src/assets/projects/*.png`), so they only exist on this machine. Drop new
// screenshots over them whenever the app's UI changes, then re-run this. Only
// the derived .webp files are committed and imported by
// src/components/projects/projects-data.ts, so keep those file names stable.
//
// Steps, in order:
//   1. Redact. Screenshots can show personal info (e.g. a private reminder
//      widget on the Lock Screen). REDACTIONS below lists, per master, the
//      rectangles to obscure in ORIGINAL pixel coordinates. This runs before
//      any resize and overwrites the master PNG in place, so unredacted
//      pixels never persist locally and every derived image comes from
//      redacted pixels. Re-running on an already-redacted master is harmless
//      (it just blurs the blur again).
//      NEW SCREENSHOTS MUST HAVE THEIR RECTANGLES CHECKED/UPDATED HERE: a
//      new capture can lay things out differently, and a stale rectangle
//      would leave private text readable. Inspect the output before commit.
//   2. Resize. Portrait masters -> 400w + 600w WebP; landscape -> 900w + 1800w.
//   3. Card. Composes the 1600x900 social/card image (two phones on a
//      synthwave gradient) from the redacted masters, writes the
//      pomodoro-card.png master, then 800w + 1600w WebP.
import sharp from 'sharp'
import { readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'src', 'assets', 'projects')

const WEBP = { quality: 82, effort: 6 }

// Masters to resize. Orientation is derived from each image.
const MASTERS = [
  'pomodoro-app',
  'pomodoro-lock-screen',
  'pomodoro-widget',
  'pomodoro-standby',
]
const PORTRAIT_WIDTHS = [400, 600]
const LANDSCAPE_WIDTHS = [900, 1800]

// Rectangles to redact, per master file, in original pixel coordinates.
// Lock screen: personal reminder widget under the clock; stops short of the
// circular widget at x~715.
const REDACTIONS = {
  'pomodoro-lock-screen.png': [{ left: 60, top: 650, width: 640, height: 190 }],
}

const CARD = { width: 1600, height: 900 }
const PHONES = [
  // Back phone first; later entries draw on top.
  { master: 'pomodoro-lock-screen', edge: [0, 240, 255], angle: -4, x: 790, y: 60 },
  { master: 'pomodoro-app', edge: [255, 43, 214], angle: 4, x: 470, y: 70 },
]
const SCREEN_HEIGHT = 720
const BEZEL = 14
const OUTER_RADIUS = 62
const SCREEN_RADIUS = 48
const OUTLINE = 2
const HALO_ALPHA = 0.45
const HALO_SIGMA = 28

const written = []

const masterPath = (name) => path.join(dir, `${name}.png`)

async function readMaster(file) {
  try {
    return await readFile(path.join(dir, file))
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Missing master image. Put the full-size screenshot at ${path.join(dir, file)}`)
    }
    throw err
  }
}

async function report(file) {
  const meta = await sharp(file).metadata()
  const { size } = await stat(file)
  written.push(`${path.relative(root, file)}  ${meta.width}x${meta.height}  ${(size / 1024).toFixed(1)} KB`)
}

const rgb = ([r, g, b]) => `rgb(${r},${g},${b})`

// --- 1. Redaction -----------------------------------------------------------

async function redactRegion(input, rect) {
  const { left, top, width, height } = rect
  const meta = await sharp(input).metadata()
  if (left < 0 || top < 0 || left + width > meta.width || top + height > meta.height) {
    throw new Error(`Redaction rect ${JSON.stringify(rect)} is outside the ${meta.width}x${meta.height} image`)
  }

  // Pixelate (downscale ~48x, upscale with nearest), then blur hard twice.
  const small = await sharp(input)
    .extract(rect)
    .resize(Math.max(1, Math.round(width / 48)), Math.max(1, Math.round(height / 48)), { kernel: 'lanczos3' })
    .toBuffer()
  const pixelated = await sharp(small).resize(width, height, { kernel: 'nearest' }).toBuffer()
  const blurred1 = await sharp(pixelated).blur(40).toBuffer()
  const blurred = await sharp(blurred1).blur(40).removeAlpha().toBuffer()

  // Feathered rounded-rect mask so the patch blends into the wallpaper.
  const inset = 24
  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="black"/>
    <rect x="${inset}" y="${inset}" width="${width - inset * 2}" height="${height - inset * 2}" rx="40" fill="white"/>
  </svg>`
  const mask = await sharp(Buffer.from(maskSvg))
    .blur(12)
    .extractChannel(0)
    .raw()
    .toBuffer()

  const patch = await sharp(blurred)
    .joinChannel(mask, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer()

  return sharp(input).composite([{ input: patch, left, top }]).png().toBuffer()
}

async function redactMasters() {
  for (const [file, rects] of Object.entries(REDACTIONS)) {
    let buf = await readMaster(file)
    for (const rect of rects) buf = await redactRegion(buf, rect)
    await writeFile(path.join(dir, file), buf)
    console.log(`Redacted ${rects.length} region(s) in ${file}`)
  }
}

// --- 2. Resize --------------------------------------------------------------

async function resizeMasters() {
  for (const name of MASTERS) {
    const buf = await readMaster(`${name}.png`)
    const { width, height } = await sharp(buf).metadata()
    const widths = width > height ? LANDSCAPE_WIDTHS : PORTRAIT_WIDTHS
    for (const w of widths) {
      const out = path.join(dir, `${name}-${w}.webp`)
      await sharp(buf).resize({ width: w, kernel: 'lanczos3' }).webp(WEBP).toFile(out)
      await report(out)
    }
  }
}

// --- 3. Card ----------------------------------------------------------------

const SCALE = 2 // render at 2x, downscale at the end for clean edges

// Gradient plus a heavily blurred magenta glow (blurred with sharp, not an SVG
// filter, which renders at an unpredictable size).
async function buildBackground() {
  const w = CARD.width * SCALE
  const h = CARD.height * SCALE
  const gradient = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgb(21,10,36)"/>
        <stop offset="1" stop-color="rgb(10,6,18)"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
  </svg>`
  const glow = await sharp(
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <ellipse cx="${w * 0.5}" cy="${h * 0.76}" rx="${w * 0.32}" ry="${h * 0.34}" fill="rgb(120,20,110)"/>
    </svg>`),
  )
    .blur(130 * SCALE)
    .png()
    .toBuffer()
  return sharp(Buffer.from(gradient)).composite([{ input: glow, left: 0, top: 0 }]).png().toBuffer()
}

// Returns a transparent layer (halo + phone, rotated) and the offset to draw it at.
async function buildPhone({ master, edge, angle, x, y }) {
  const buf = await readMaster(`${master}.png`)
  const screenH = SCREEN_HEIGHT * SCALE
  const screen = await sharp(buf).resize({ height: screenH, kernel: 'lanczos3' }).png().toBuffer()
  const screenW = (await sharp(screen).metadata()).width
  const bezel = BEZEL * SCALE
  const phoneW = screenW + bezel * 2
  const phoneH = screenH + bezel * 2
  const pad = HALO_SIGMA * SCALE * 4
  const layerW = phoneW + pad * 2
  const layerH = phoneH + pad * 2
  const outerR = OUTER_RADIUS * SCALE
  const edgeColor = rgb(edge)

  const halo = await sharp(
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${layerW}" height="${layerH}">
      <rect x="${pad}" y="${pad}" width="${phoneW}" height="${phoneH}" rx="${outerR}" fill="${edgeColor}" fill-opacity="${HALO_ALPHA}"/>
    </svg>`),
  )
    .blur(HALO_SIGMA * SCALE)
    .png()
    .toBuffer()

  const roundedScreen = await sharp(screen)
    .composite([
      {
        input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${screenW}" height="${screenH}">
          <rect width="${screenW}" height="${screenH}" rx="${SCREEN_RADIUS * SCALE}" fill="white"/>
        </svg>`),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer()

  const outline = (OUTLINE * SCALE) / 2
  const bezelSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${layerW}" height="${layerH}">
    <rect x="${pad + outline}" y="${pad + outline}" width="${phoneW - outline * 2}" height="${phoneH - outline * 2}"
      rx="${outerR - outline}" fill="rgb(6,4,10)" stroke="${edgeColor}" stroke-width="${OUTLINE * SCALE}"/>
  </svg>`

  const flat = await sharp(halo)
    .composite([
      { input: Buffer.from(bezelSvg), left: 0, top: 0 },
      { input: roundedScreen, left: pad + bezel, top: pad + bezel },
    ])
    .png()
    .toBuffer()

  // sharp rotates clockwise for positive angles; the spec angles are
  // counter-clockwise-positive, so negate.
  const rotated = await sharp(flat)
    .rotate(-angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  const rm = await sharp(rotated).metadata()

  // (x, y) is the unrotated phone's top-left; keep its centre fixed.
  const cx = (x + phoneW / SCALE / 2) * SCALE
  const cy = (y + phoneH / SCALE / 2) * SCALE
  return { input: rotated, left: Math.round(cx - rm.width / 2), top: Math.round(cy - rm.height / 2), width: rm.width, height: rm.height }
}

// sharp's composite rejects negative offsets, so crop any overhang first.
async function clipToCanvas(layer, canvasW, canvasH) {
  const cropLeft = Math.max(0, -layer.left)
  const cropTop = Math.max(0, -layer.top)
  const w = Math.min(layer.width - cropLeft, canvasW - Math.max(0, layer.left))
  const h = Math.min(layer.height - cropTop, canvasH - Math.max(0, layer.top))
  const input = await sharp(layer.input).extract({ left: cropLeft, top: cropTop, width: w, height: h }).png().toBuffer()
  return { input, left: Math.max(0, layer.left), top: Math.max(0, layer.top) }
}

async function buildCard() {
  const w = CARD.width * SCALE
  const h = CARD.height * SCALE
  const layers = []
  for (const phone of PHONES) {
    layers.push(await clipToCanvas(await buildPhone(phone), w, h))
  }
  // composite() runs after resize() inside one sharp pipeline, so flatten first.
  const big = await sharp(await buildBackground()).composite(layers).png().toBuffer()
  const png = await sharp(big)
    .resize(CARD.width, CARD.height, { kernel: 'lanczos3' })
    .png()
    .toBuffer()

  const master = path.join(dir, 'pomodoro-card.png')
  await writeFile(master, png)
  await report(master)
  for (const cw of [800, 1600]) {
    const out = path.join(dir, `pomodoro-card-${cw}.webp`)
    await sharp(png).resize({ width: cw, kernel: 'lanczos3' }).webp(WEBP).toFile(out)
    await report(out)
  }
}

// --- Run --------------------------------------------------------------------

try {
  await redactMasters()
  await resizeMasters()
  await buildCard()
  console.log('\nWrote:\n' + written.map((l) => `  ${l}`).join('\n'))
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}
