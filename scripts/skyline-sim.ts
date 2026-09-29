/// <reference types="node" />
// Dev-only balance simulation for Skyline Defense (not part of the build or
// the test suite). Plays seeded games with a simulated player using the
// game's real logic and prints, per wave, the share of the city kept (among
// runs still going), the share of runs still going, kills per shot, and
// (among runs still going) average points scored that wave and average
// longest chain.
//
//   npm run sim                                  human player at 1280x741 and 390x791
//   npm run sim -- --width 768 --height 965      one canvas size
//   npm run sim -- --player all --waves 8        every player, 8 waves
//   npm run sim -- --runs 100 --aim-error 8      faster run, custom aim error
//   npm run sim -- --chase-bonus                 the player also shoots UFOs/scouts
//
// Players:
//   human  (default) fires every 0.35s at the lowest meteor it hasn't shot,
//          only after it's been on screen 0.25s, misjudging the lead by ~20%
//   quick  every 0.35s, perfect lead      slow  every 0.8s, perfect lead
//   smart  every 0.35s, aims at the center of the group around the lowest meteor
// Every player ignores the bonus targets (UFOs, scouts) unless --chase-bonus
// is passed; then it shoots at one on screen (leading it, with the same lead
// error) whenever no meteor is past 60% of the way down.
//
// "ammo left" is the average unused interceptors at the end of the wave
// (among runs still going).
//
// Boss waves: every player shoots the boss (leading it, with the same lead
// and aim error, at most once every BOSS_SHOT_GAP seconds) whenever no
// meteor is past 60% of the way down, and first of all once the boss is
// past 45% of the way down. After the table, each boss wave's kill rate
// (among runs that reached it) and the average wave runs ended on.
import { parseArgs } from 'node:util'
import { createGame, fire, startGame, step, totalAmmo } from '../src/components/skyline-defense/game/engine'
import { blastMaxRadius, nearestLauncherWithAmmo } from '../src/components/skyline-defense/game/geometry'
import { hudHeight } from '../src/components/skyline-defense/render/hud'
import { isBossWave } from '../src/components/skyline-defense/game/bossStats'
import { TUNING } from '../src/components/skyline-defense/game/tuning'
import type { Boss, GameState, Meteor, Vec } from '../src/components/skyline-defense/game/types'

const PLAYERS = ['human', 'quick', 'slow', 'smart'] as const
type Player = (typeof PLAYERS)[number]
type Size = { width: number; height: number; aimError: number; label: string }
type BossResult = 'destroyed' | 'impact' | 'lost' | null
type WaveResult = {
  alive: boolean
  kept: number
  kills: number
  shots: number
  score: number
  longestChain: number
  ammoLeft: number
  boss: BossResult
}

const REACTION = 0.25
const BOSS_SHOT_GAP = 0.6
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

function play(size: Size, seed: number, player: Player, waves: number, chaseBonus: boolean): WaveResult[] {
  const noise = mulberry32(seed * 7 + 1)
  const gauss = () => Math.sqrt(-2 * Math.log(noise() || 1e-9)) * Math.cos(2 * Math.PI * noise())
  // Bonus targets and bosses get their own streams, so a seed's meteors don't change.
  const game = createGame(size.width, size.height, mulberry32(seed), mulberry32(seed * 31 + 17), mulberry32(seed * 53 + 5))
  game.hudBottom = hudHeight(size.width)
  startGame(game)
  const bonusShotAt = new Map<number, number>()
  let waveStartScore = 0
  const total = game.buildings.length
  const radius = blastMaxRadius(size.width, size.height)
  const targeted = new Set<number>()
  const firstSeen = new Map<number, number>()
  const counted = new Set<number>()
  const results: WaveResult[] = []
  let kills = 0
  let shots = 0
  let think = 0
  let bossShotAt = -Infinity
  const bossResult = (): BossResult => (isBossWave(game.wave) ? (game.bossOutcome ?? 'lost') : null)

  for (let t = 0; t < waves * 200 && results.length < waves; t += DT) {
    const wave = game.wave
    step(game, DT)
    for (const blast of game.blasts) {
      if ((blast.kind === 'chain' || blast.kind === 'bonus') && !counted.has(blast.id)) {
        counted.add(blast.id)
        kills++
      }
    }
    if (game.phase === 'waveBonus' && results.length < wave) {
      const kept = game.buildings.filter((b) => b.alive).length / total
      const score = game.score - waveStartScore
      results.push({ alive: true, kept, kills, shots, score, longestChain: game.waveLongestChain, ammoLeft: totalAmmo(game), boss: bossResult() })
      waveStartScore = game.score
      kills = 0
      shots = 0
    }
    if (game.phase === 'gameOver') {
      const boss = bossResult()
      while (results.length < waves) {
        const lost = results.length === game.wave - 1
        results.push({ alive: false, kept: 0, kills, shots, score: 0, longestChain: 0, ammoLeft: 0, boss: lost ? boss : null })
      }
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

    const boss = game.boss
    const urgent = lowest && lowest.pos.y > game.groundY * 0.6
    if (boss && boss.pos.y > 0 && t - bossShotAt >= BOSS_SHOT_GAP && (!urgent || boss.pos.y > game.groundY * 0.45)) {
      const aimAt = leadBoss(game, boss, misjudge)
      if (aimAt && fire(game, { x: aimAt.x + gauss() * size.aimError, y: aimAt.y + gauss() * size.aimError })) shots++
      bossShotAt = t
      continue
    }
    if (chaseBonus && !(lowest && lowest.pos.y > game.groundY * 0.6)) {
      const bonus = chaseTarget(game, t, bonusShotAt)
      if (bonus) {
        const aimAt = leadBonus(game, bonus, misjudge)
        if (aimAt && fire(game, { x: aimAt.x + gauss() * size.aimError, y: aimAt.y + gauss() * size.aimError })) shots++
        bonusShotAt.set(bonus.id, t)
        continue
      }
    }
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

// Where the boss will be when an interceptor reaches it (it stands still
// while stalled after a hit), optionally misjudged.
function leadBoss(game: GameState, boss: Boss, misjudge: number): Vec | null {
  const launcher = nearestLauncherWithAmmo(game.launchers, boss.pos.x)
  if (!launcher) return null
  const vel = boss.stall > 0 ? { x: 0, y: 0 } : boss.vel
  let aim = { ...boss.pos }
  for (let i = 0; i < 3; i++) {
    const time =
      Math.hypot(aim.x - launcher.x, aim.y - launcher.y) / (TUNING.interceptorSpeed * game.height) + TUNING.blastGrow / 2
    aim = { x: boss.pos.x + vel.x * time, y: boss.pos.y + vel.y * time }
  }
  return { x: aim.x + (aim.x - boss.pos.x) * misjudge, y: aim.y + (aim.y - boss.pos.y) * misjudge }
}

// An on-screen UFO or scout not shot at in the last 1.2s (UFOs first).
function chaseTarget(game: GameState, t: number, shotAt: Map<number, number>) {
  const ready = (target: { id: number; pos: Vec }) =>
    target.pos.x > 0 && target.pos.x < game.width && t - (shotAt.get(target.id) ?? -Infinity) > 1.2
  return game.ufos.find(ready) ?? game.scouts.find(ready)
}

// Where a bonus target will be when an interceptor reaches it (it moves
// sideways at a constant speed), optionally misjudged.
function leadBonus(game: GameState, target: { pos: Vec; vx: number }, misjudge: number): Vec | null {
  const launcher = nearestLauncherWithAmmo(game.launchers, target.pos.x)
  if (!launcher) return null
  let x = target.pos.x
  for (let i = 0; i < 3; i++) {
    const time =
      Math.hypot(x - launcher.x, target.pos.y - launcher.y) / (TUNING.interceptorSpeed * game.height) + TUNING.blastGrow / 2
    x = target.pos.x + target.vx * time
  }
  return { x: x + (x - target.pos.x) * misjudge, y: target.pos.y }
}

function report(size: Size, player: Player, runs: number, waves: number, chaseBonus: boolean) {
  const games = Array.from({ length: runs }, (_, i) => play(size, i + 1, player, waves, chaseBonus))
  const pct = (value: number) => `${value.toFixed(1)}%`.padStart(7)
  const mode = chaseBonus ? ', chasing bonus targets' : ''
  console.log(`\n${size.label}  ${player}  (${runs} runs, aim error ${size.aimError}px${mode})`)
  console.log('wave  city kept  runs alive  kills/shot  avg score  longest chain  ammo left')
  for (let w = 0; w < waves; w++) {
    const rows = games.map((g) => g[w])
    const alive = rows.filter((r) => r.alive)
    const kept = alive.length ? (alive.reduce((sum, r) => sum + r.kept, 0) / alive.length) * 100 : 0
    const shots = rows.reduce((sum, r) => sum + r.shots, 0)
    const perShot = rows.reduce((sum, r) => sum + r.kills, 0) / Math.max(shots, 1)
    const avg = (pick: (r: WaveResult) => number) =>
      alive.length ? alive.reduce((sum, r) => sum + pick(r), 0) / alive.length : 0
    console.log(
      `${String(w + 1).padStart(4)}  ${pct(kept)}    ${pct((alive.length / runs) * 100)}     ${perShot.toFixed(2)}` +
        `  ${String(Math.round(avg((r) => r.score))).padStart(9)}  ${avg((r) => r.longestChain).toFixed(2).padStart(13)}` +
        `  ${avg((r) => r.ammoLeft).toFixed(1).padStart(9)}` +
        (isBossWave(w + 1) ? '  boss' : ''),
    )
  }
  for (let w = TUNING.bossEvery; w <= waves; w += TUNING.bossEvery) {
    const fought = games.map((g) => g[w - 1].boss).filter((b) => b !== null)
    if (fought.length === 0) continue
    const share = (outcome: BossResult) => pct((fought.filter((b) => b === outcome).length / fought.length) * 100)
    console.log(
      `boss wave ${w}: fought in ${fought.length} runs; destroyed ${share('destroyed')}, ` +
        `reached the city ${share('impact')}, city fell first ${share('lost')}`,
    )
  }
  const ended = games.map((g) => {
    const lost = g.findIndex((r) => !r.alive)
    return lost === -1 ? waves : lost + 1
  })
  const sorted = [...ended].sort((a, b) => a - b)
  const mean = ended.reduce((sum, w) => sum + w, 0) / ended.length
  console.log(`run length: mean wave ${mean.toFixed(2)}, median ${sorted[Math.floor(sorted.length / 2)]} (capped at ${waves})`)
}

const { values } = parseArgs({
  options: {
    width: { type: 'string' },
    height: { type: 'string' },
    waves: { type: 'string', default: '6' },
    player: { type: 'string', default: 'human' },
    runs: { type: 'string', default: '300' },
    'aim-error': { type: 'string' },
    'chase-bonus': { type: 'boolean', default: false },
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

for (const player of players) for (const size of sizes) report(size, player, runs, waves, values['chase-bonus'])
