// Manual script (not part of `npm run build`): renders og-image.html in
// headless Chromium and saves a 1200x630 screenshot as the site's
// link-preview banner. Run with `npm run og:image`; pass a path to write
// somewhere else instead, e.g. `npm run og:image -- /tmp/preview.png`.
import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const source = path.join(here, 'og-image.html')
const out = path.resolve(process.argv[2] ?? path.join(here, '..', '..', 'public', 'og-image.png'))

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.goto(pathToFileURL(source).href)
  // The banner must use its bundled font, never an OS fallback, so it
  // renders the same everywhere.
  const fonts = { 500: 'poppins-medium.woff2', 600: 'poppins-semibold.woff2', 700: 'poppins-bold.woff2' }
  const missing = await page.evaluate(async (fonts) => {
    await document.fonts.ready
    const loaded = [...document.fonts].filter((f) => f.family.replace(/['"]/g, '') === 'Poppins' && f.status === 'loaded')
    return Object.keys(fonts).filter((w) => !loaded.some((f) => f.weight === w))
  }, fonts)
  if (missing.length) {
    throw new Error(`Bundled font(s) did not load: ${missing.map((w) => fonts[w]).join(', ')}`)
  }
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } })
} finally {
  await browser.close()
}

console.log(`Wrote ${path.relative(process.cwd(), out)}`)
