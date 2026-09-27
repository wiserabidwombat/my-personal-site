/// <reference types="node" />
// Dev-only balance simulation for Skyline Defense (not part of the build or
// the test suite). Plays seeded games with a simulated player using the
// game's real logic and prints, per wave, the share of the city kept (among
// runs still going), the share of runs still going, and kills per shot.
//
//   npm run sim                                  human player at 1280x741 and 390x791
//   npm run sim -- --width 768 --height 965      one canvas size
//   npm run sim -- --player all --waves 8        every player, 8 waves
//   npm run sim -- --runs 100 --aim-error 8      faster run, custom aim error
//
// Players:
//   human  (default) fires every 0.35s at the lowest meteor it hasn't shot,
//          only after it's been on screen 0.25s, misjudging the lead by ~20%
//   quick  every 0.35s, perfect lead      slow  every 0.8s, perfect lead
//   smart  every 0.35s, aims at the center of the group around the lowest meteor
import { parseArgs } from 'node:util'
import { createGame, fire, startGame, step } from '../src/components/skyline-defense/game/engine'
import { blastMaxRadius, nearestLauncherWithAmmo } from '../src/components/skyline-defense/game/geometry'
import { TUNING } from '../src/components/skyline-defense/game/tuning'
import type { GameState, Meteor, Vec } from '../src/components/skyline-defense/game/types'

const PLAYERS = ['human', 'quick', 'slow', 'smart'] as const
type Player = (typeof PLAYERS)[number]
type Size = { width: number; height: number; aimError: number; label: string }
type WaveResult = { alive: boolean; kept: number; kills: number; shots: number }

const REACTION = 0.25
const LEAD_ERROR = 0.2
const DT = 1 / 60

function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Where a meteor will be when an interceptor from the nearest launcher
// reaches it (plus half the blast's grow time), optionally misjudged.
function lead(game: GameState, meteor: Meteor, misjudge: number): Vec | null {
  const launcher = nearestLauncherWithAmmo(game.launchers, meteor.pos.x)
  if (!launcher) return null
  let aim = { ...meteor.pos }
  for (let i = 0; i < 3; i++) {
    const time =
      Math.hypot(aim.x - launcher.x, aim.y - launcher.y) / (TUNING.interceptorSpeed * game.height) + TUNING.blastGrow / 2
    aim = { x: meteor.pos.x + meteor.vel.x * time, y: meteor.pos.y + meteor.vel.y * time }
  }
  return { x: aim.x + (aim.x - meteor.pos.x) * misjudge, y: aim.y + (aim.y - meteor.pos.y) * misjudge }
}

function play(size: Size, seed: number, player: Player, waves: number): WaveResult[] {
  const noise = mulberry32(seed * 7 + 1)
  const gauss = () => Math.sqrt(-2 * Math.log(noise() || 1e-9)) * Math.cos(2 * Math.PI * noise())
  const game = createGame(size.width, size.height, mulberry32(seed))
  startGame(game)
  const total = game.buildings.length
  const radius = blastMaxRadius(size.width, size.height)
  const targeted = new Set<number>()
  const firstSeen = new Map<number, number>()
  const counted = new Set<number>()
  const results: WaveResult[] = []
  let kills = 0
  let shots = 0
  let think = 0

  for (let t = 0; t < waves * 200 && results.length < waves; t += DT) {
    const wave = game.wave
    step(game, DT)
    for (const blast of game.blasts) {
      if (blast.kind === 'chain' && !counted.has(blast.id)) {
        counted.add(blast.id)
        kills++
      }
    }
    if (game.phase === 'waveBonus' && results.length < wave) {
      results.push({ alive: true, kept: game.buildings.filter((b) => b.alive).length / total, kills, shots })
      kills = 0
      shots = 0
    }
    if (game.phase === 'gameOver') {
      while (results.length < waves) results.push({ alive: false, kept: 0, kills, shots })
      break
    }

    think -= DT
    if (game.phase !== 'playing' || think > 0) continue
    think = player === 'slow' ? 0.8 : 0.35
    for (const m of game.meteors) if (m.pos.y > 0 && !firstSeen.has(m.id)) firstSeen.set(m.id, t)
    const noticed = (m: Meteor) => player !== 'human' || t - (firstSeen.get(m.id) ?? t) >= REACTION
    const open = game.meteors
      .filter((m) => !targeted.has(m.id) && m.pos.y > 30 && noticed(m))
      .sort((a, b) => b.pos.y - a.pos.y)
    const lowest = open[0]
    const misjudge = player === 'human' ? gauss() * LEAD_ERROR : 0
    const aim = lowest && lead(game, lowest, misjudge)
    if (!lowest || !aim) continue

    let point = aim
    let group = [lowest]
    if (player === 'smart') {
      const near = open
        .map((m) => ({ m, p: lead(game, m, 0) }))
        .filter((e): e is { m: Meteor; p: Vec } => !!e.p && Math.hypot(e.p.x - aim.x, e.p.y - aim.y) <= radius * 1.4)
      group = near.map((e) => e.m)
      point = {
        x: near.reduce((sum, e) => sum + e.p.x, 0) / near.length,
        y: near.reduce((sum, e) => sum + e.p.y, 0) / near.length,
      }
    }
    if (fire(game, { x: point.x + gauss() * size.aimError, y: point.y + gauss() * size.aimError })) shots++
    for (const m of group) targeted.add(m.id)
  }
  return results
}

function report(size: Size, player: Player, runs: number, waves: number) {
  const games = Array.from({ length: runs }, (_, i) => play(size, i + 1, player, waves))
  const pct = (value: number) => `${value.toFixed(1)}%`.padStart(7)
  console.log(`\n${size.label}  ${player}  (${runs} runs, aim error ${size.aimError}px)`)
  console.log('wave  city kept  runs alive  kills/shot')
  for (let w = 0; w < waves; w++) {
    const rows = games.map((g) => g[w])
    const alive = rows.filter((r) => r.alive)
    const kept = alive.length ? (alive.reduce((sum, r) => sum + r.kept, 0) / alive.length) * 100 : 0
    const shots = rows.reduce((sum, r) => sum + r.shots, 0)
    const perShot = rows.reduce((sum, r) => sum + r.kills, 0) / Math.max(shots, 1)
    console.log(
      `${String(w + 1).padStart(4)}  ${pct(kept)}    ${pct((alive.length / runs) * 100)}     ${perShot.toFixed(2)}`,
    )
  }
}

const { values } = parseArgs({
  options: {
    width: { type: 'string' },
    height: { type: 'string' },
    waves: { type: 'string', default: '6' },
    player: { type: 'string', default: 'human' },
    runs: { type: 'string', default: '300' },
    'aim-error': { type: 'string' },
  },
})

function fail(message: string): never {
  console.error(`skyline-sim: ${message}`)
  process.exit(1)
}

const waves = Number(values.waves)
const runs = Number(values.runs)
const players: Player[] = values.player === 'all' ? [...PLAYERS] : [values.player as Player]
if (players.some((p) => !PLAYERS.includes(p))) {
  fail(`--player must be one of ${PLAYERS.join(', ')}, or all`)
}
if (!(waves > 0 && runs > 0)) fail('--waves and --runs must be positive numbers')
if ((values.width === undefined) !== (values.height === undefined)) fail('pass --width and --height together')
if (values.width !== undefined && !(Number(values.width) > 0 && Number(values.height) > 0)) {
  fail('--width and --height must be positive numbers')
}

// Defaults: the two reference canvases (desktop with a mouse, phone with
// touch). Aim error defaults to 6px with a mouse, 10px on touch (<600px).
const sizes: Size[] = values.width
  ? [{ width: Number(values.width), height: Number(values.height), aimError: 0, label: '' }]
  : [
      { width: 1280, height: 741, aimError: 0, label: '' },
      { width: 390, height: 791, aimError: 0, label: '' },
    ]
for (const size of sizes) {
  size.aimError = values['aim-error'] !== undefined ? Number(values['aim-error']) : size.width < 600 ? 10 : 6
  size.label = `${size.width}x${size.height}`
}

for (const player of players) for (const size of sizes) report(size, player, runs, waves)
