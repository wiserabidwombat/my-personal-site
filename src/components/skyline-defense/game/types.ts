export type Vec = { x: number; y: number }

export type BuildingKind = 'reunion' | 'bofa' | 'fountain' | 'comerica' | 'renaissance' | 'generic'

export type Building = {
  id: number
  kind: BuildingKind
  name: string
  // Bounding box: center x, width, and height above the ground, in world
  // pixels (used for aiming meteors).
  x: number
  width: number
  height: number
  // The building's outline in the skyline image, in world pixels (one or
  // more polygons): what meteors hit, and what goes dark when destroyed.
  outline: Vec[][]
  alive: boolean
}

export type Launcher = { x: number; y: number; ammo: number }

export type Meteor = {
  id: number
  // Where this meteor (or fragment) started, for drawing its trail.
  start: Vec
  pos: Vec
  vel: Vec
  // Splits into fragments on passing this y; null for plain meteors.
  splitAtY: number | null
}

export type Interceptor = { id: number; from: Vec; pos: Vec; target: Vec }

// interceptor: player's shot; chain: a destroyed meteor's own blast;
// bonus: a destroyed UFO's or scout's blast (all three destroy meteors and
// bonus targets). impact: a meteor hitting the city (harmless flash).
export type BlastKind = 'interceptor' | 'chain' | 'bonus' | 'impact'

export type Blast = {
  id: number
  kind: BlastKind
  pos: Vec
  maxRadius: number
  age: number
  // The player's shot this blast descends from (its own id for an
  // interceptor's blast), so kills can be counted per chain; null for
  // impacts.
  chainId: number | null
}

// A harmless bonus target: the flying saucer crossing the sky.
export type Ufo = { id: number; pos: Vec; vx: number; size: number; age: number }

// A harmless bonus target: one small alien in a loose, wobbling line.
export type Scout = { id: number; pos: Vec; baseY: number; vx: number; size: number; phase: number; age: number }

// Floating score text where something was destroyed: "+points" for a first
// kill, updated in place to "CHAIN xN  +total" as its chain grows.
// `chainId` ties it to its shot's chain (null for kills with no chain);
// `total` is the chain's points so far. `age` resets on each update.
export type Popup = {
  id: number
  pos: Vec
  text: string
  kind: 'points' | 'chain' | 'bonus'
  age: number
  chainId: number | null
  total: number
}

// When this wave's bonus targets appear, in seconds of play.
export type BonusPlan = { ufoTimes: number[]; scoutTime: number | null; elapsed: number }

export type Phase = 'ready' | 'waveTitle' | 'playing' | 'waveBonus' | 'gameOver'

export type WaveBonus = { buildings: number; ammo: number; total: number }

export type WaveConfig = {
  meteorCount: number
  // World pixels per second.
  meteorSpeed: number
  spawnInterval: number
  splitChance: number
  // Chance that a spawn is a salvo (a small group) rather than a single.
  salvoChance: number
  ammoPerLauncher: number
}

export type GameState = {
  width: number
  height: number
  groundY: number
  // World pixels per skyline design unit (see skylineScale): buildings and
  // launchers are drawn at this one uniform scale.
  scale: number
  phase: Phase
  // Seconds spent in the current phase.
  phaseTime: number
  wave: number
  score: number
  buildings: Building[]
  launchers: Launcher[]
  meteors: Meteor[]
  interceptors: Interceptor[]
  blasts: Blast[]
  // Meteors still to spawn this wave, and seconds until the next one.
  toSpawn: number
  spawnTimer: number
  lastBonus: WaveBonus | null
  ufos: Ufo[]
  scouts: Scout[]
  popups: Popup[]
  bonusPlan: BonusPlan
  // Kills so far in each chain this wave, by chain id, and the longest.
  chains: Record<number, number>
  waveLongestChain: number
  // Bottom of the HUD (set by the page, which draws it); bonus targets fly
  // between this and the top of the skyline image.
  hudBottom: number
  // prefers-reduced-motion: scouts fly straight (no wobble).
  reducedMotion: boolean
  nextId: number
  rng: () => number
  // Bonus targets use their own random stream, so adding them doesn't
  // change the meteors a given seed produces.
  bonusRng: () => number
}
