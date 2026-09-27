import type { Building, BuildingKind, Launcher, Vec } from './types'

// The city is the home page's dark skyline art (src/assets/dallas-skyline.webp),
// drawn as one image layer. This module maps that image onto the world and
// lays out the defended buildings from hand-placed outlines of each
// landmark, in the image's own pixels.
export const CITY_IMAGE = { width: 2172, height: 724 } as const

// The rows of the image the game shows: from its top row (flat sky, so the
// game sky can blend into it) down to the tree line, whose bottom sits on
// the ground line.
export const CITY_BAND = { top: 0, bottom: 500 } as const

// Below this world width the image is cropped to a window centered on the
// landmarks (like the home page's mobile crop, but centered), so Reunion
// Tower and Bank of America Plaza stay in view at a readable size. On tall
// phones (height at least TALL_ASPECT x width) the window narrows so the
// city draws ~18% larger; it still starts just left of Reunion Tower and
// ends past Bank of America Plaza, and any tower it cuts is scenery only
// (layoutBuildings skips regions not fully in view).
export const NARROW_WIDTH = 560
export const TALL_ASPECT = 1.8
const CROPS = {
  wide: { left: 0, right: CITY_IMAGE.width },
  narrow: { left: 380, right: 990 },
  tall: { left: 390, right: 907 },
}

type Shape = { polygon: [number, number][] } | { rect: [number, number, number, number] } | { circle: [number, number, number] }
// `narrowOnly`: defended only on narrow (phone) crops, so phones have five
// targets; on wide screens the building is scenery.
type Region = { kind: BuildingKind; name: string; shapes: Shape[]; narrowOnly?: boolean }

// Each defended building's outline in image pixels (union of shapes),
// traced to its visible edge: where a building in front covers part of
// it, the outline stops there, so destroying it dims nothing else.
export const REGIONS: readonly Region[] = [
  {
    kind: 'reunion',
    name: 'Reunion Tower',
    shapes: [
      { circle: [445, 220, 45] },
      { rect: [424, 258, 433, 465] },
      { rect: [439, 258, 448, 465] },
      { rect: [453, 258, 462, 465] },
    ],
  },
  {
    kind: 'generic',
    name: 'Gold-domed building',
    narrowOnly: true,
    shapes: [
      {
        polygon: [
          [481, 486], [481, 413], [515, 413], [520, 400], [526, 390], [530, 383], [534, 390], [540, 400],
          [547, 413], [586, 413], [586, 486],
        ],
      },
    ],
  },
  {
    kind: 'fountain',
    name: 'Fountain Place',
    // Stops at the gold dome's roofline (lower left) and at the dark
    // building in front of its lower right.
    shapes: [
      {
        polygon: [
          [614, 244], [655, 330], [655, 373], [663, 373], [663, 440], [643, 440], [643, 455],
          [587, 455], [587, 413], [553, 413], [553, 318],
        ],
      },
    ],
  },
  {
    kind: 'bofa',
    name: 'Bank of America Plaza',
    // Down to where the rooftops in front begin; the lower right steps
    // around the building in front of it.
    shapes: [
      {
        polygon: [
          [712, 483], [712, 121], [719, 112], [729, 106], [745, 101], [766, 101], [781, 106], [790, 112],
          [796, 121], [796, 452], [790, 452], [790, 483],
        ],
      },
    ],
  },
  {
    kind: 'generic',
    name: 'Tower east of Bank of America',
    narrowOnly: true,
    shapes: [{ polygon: [[800, 450], [800, 340], [845, 340], [845, 307], [858, 307], [858, 450]] }],
  },
  {
    kind: 'renaissance',
    name: 'Renaissance Tower',
    // Stops at the pink building in front of its lower right and the
    // rooftops below.
    shapes: [
      {
        polygon: [
          [869, 450], [869, 256], [886, 247], [887, 204], [893, 200], [898, 206], [905, 196], [910, 186],
          [916, 184], [917, 150], [923, 150], [924, 184], [930, 186], [935, 196], [942, 206], [947, 200],
          [953, 204], [954, 247], [972, 256], [972, 350], [935, 350], [935, 450],
        ],
      },
    ],
  },
  { kind: 'generic', name: 'Antenna tower', shapes: [{ rect: [1062, 259, 1100, 440] }, { rect: [1079, 232, 1084, 259] }] },
  {
    kind: 'comerica',
    name: 'Comerica Bank Tower',
    // Stops above the lit buildings at its base.
    shapes: [
      {
        polygon: [
          [1386, 386], [1386, 285], [1400, 257], [1413, 283], [1423, 283],
          [1437, 261], [1451, 283], [1460, 285], [1460, 355], [1455, 355], [1455, 386],
        ],
      },
    ],
  },
  { kind: 'generic', name: 'Slim tower', shapes: [{ rect: [1520, 205, 1566, 440] }] },
  { kind: 'generic', name: 'Short tower', shapes: [{ rect: [1714, 246, 1756, 395] }] },
]

export const LAUNCHER_SIZE = { width: 40, height: 13 }
export const launcherFractions = [0.07, 0.5, 0.93] as const

export function groundLevel(height: number): number {
  return Math.round(height * 0.86)
}

// How the image maps onto a world this size: which columns are shown
// (`crop`), world pixels per image pixel (`scale`), and where image pixel
// (x, y) lands: (x - crop.left) * scale, groundY - (CITY_BAND.bottom - y) * scale.
export type CityView = { crop: { left: number; right: number }; scale: number; groundY: number }

export function cityView(width: number, height: number): CityView {
  const crop = width >= NARROW_WIDTH ? CROPS.wide : height >= width * TALL_ASPECT ? CROPS.tall : CROPS.narrow
  return { crop, scale: width / (crop.right - crop.left), groundY: groundLevel(height) }
}

export function toWorld(view: CityView, x: number, y: number): Vec {
  return { x: (x - view.crop.left) * view.scale, y: view.groundY - (CITY_BAND.bottom - y) * view.scale }
}

// Kept for the launchers' size (see LAUNCHER_SIZE): the image's scale.
export function skylineScale(width: number, height: number): number {
  return cityView(width, height).scale
}

export function shapeOutline(shape: Shape): [number, number][] {
  if ('polygon' in shape) return shape.polygon
  if ('rect' in shape) {
    const [x0, y0, x1, y1] = shape.rect
    return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
  }
  const [cx, cy, r] = shape.circle
  return Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as [number, number]
  })
}

// The buildings whose outlines are fully inside the visible crop, in world
// coordinates: outline polygons for hits and "lights out", plus a bounding
// box (x = center, width, height above the ground) for targeting.
export function layoutBuildings(width: number, height: number): Building[] {
  const view = cityView(width, height)
  const wide = view.crop === CROPS.wide
  return REGIONS.flatMap((region) => {
    if (wide && region.narrowOnly) return []
    const outlines = region.shapes.map(shapeOutline)
    const xs = outlines.flat().map(([x]) => x)
    if (Math.min(...xs) < view.crop.left || Math.max(...xs) > view.crop.right) return []
    const outline = outlines.map((points) => points.map(([x, y]) => toWorld(view, x, y)))
    const left = Math.min(...outline.flat().map((p) => p.x))
    const right = Math.max(...outline.flat().map((p) => p.x))
    const top = Math.min(...outline.flat().map((p) => p.y))
    return [{ id: 0, kind: region.kind, name: region.name, x: (left + right) / 2, width: right - left, height: view.groundY - top, outline, alive: true }]
  }).map((building, id) => ({ ...building, id }))
}

export function layoutLaunchers(width: number, height: number, ammo: number): Launcher[] {
  const groundY = groundLevel(height)
  return launcherFractions.map((fraction) => ({ x: fraction * width, y: groundY, ammo }))
}
