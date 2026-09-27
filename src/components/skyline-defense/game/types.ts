export type Vec = { x: number; y: number }

export type BuildingKind = 'reunion' | 'bofa' | 'fountain' | 'comerica' | 'renaissance' | 'generic'

export type Building = {
  id: number
  kind: BuildingKind
  // Center x, base width, and height above the ground, in world pixels.
  x: number
  width: number
  height: number
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

// interceptor: player's shot; chain: a destroyed meteor's own blast (both
// destroy meteors). impact: a meteor hitting the city (harmless flash).
export type BlastKind = 'interceptor' | 'chain' | 'impact'

export type Blast = { id: number; kind: BlastKind; pos: Vec; maxRadius: number; age: number }

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
  nextId: number
  rng: () => number
}
