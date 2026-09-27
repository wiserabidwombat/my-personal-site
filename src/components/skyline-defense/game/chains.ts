import { waveMultiplier } from './scoring'
import { TUNING } from './tuning'
import type { GameState, Popup, Vec } from './types'

// The multiplier for the Nth kill in a chain (1st x1, 2nd x2, ...), capped.
export function chainMultiplier(killNumber: number): number {
  return Math.min(Math.max(Math.floor(killNumber), 1), TUNING.chainMultiplierCap)
}

// Points for one kill: base points x the wave multiplier x the chain
// multiplier for its place in the chain.
export function killPoints(base: number, wave: number, killNumber: number): number {
  return base * waveMultiplier(wave) * chainMultiplier(killNumber)
}

// Counts a kill toward its chain (blasts with no chain start fresh) and
// returns its place in the chain.
export function registerKill(state: GameState, chainId: number | null): number {
  if (chainId === null) return 1
  const count = (state.chains[chainId] ?? 0) + 1
  state.chains[chainId] = count
  state.waveLongestChain = Math.max(state.waveLongestChain, count)
  return count
}

const MAX_POPUPS = 24

// A new popup that lands near another (two chains close together) takes the
// nearest free line instead of printing on top of it, looking upward first
// and downward once it would reach the HUD. Lines are measured where popups
// are shown now (they rise as they age; see popupShownY and drawPopups).
const STACK_WIDTH = 60
const STACK_STEP = 16
export const POPUP_RISE = 18

// Chain popups hold still (anchored near the first kill); others rise.
export const popupShownY = (p: Popup) =>
  p.kind === 'chain' ? p.pos.y : p.pos.y - (p.age / TUNING.popupSeconds) * POPUP_RISE

export function addPopup(
  state: GameState,
  pos: Vec,
  text: string,
  kind: Popup['kind'],
  chainId: number | null = null,
  total = 0,
) {
  const column = state.popups.filter((p) => Math.abs(p.pos.x - pos.x) < STACK_WIDTH).map(popupShownY)
  const taken = (y: number) => column.some((other) => Math.abs(other - y) < STACK_STEP)
  const floor = state.hudBottom + STACK_STEP
  let y = Math.max(pos.y, floor)
  let direction = -1
  for (let tries = 0; taken(y) && tries < MAX_POPUPS * 2; tries++) {
    y += direction * STACK_STEP
    if (y < floor) {
      direction = 1
      y = Math.max(pos.y, floor)
    }
  }
  state.popups.push({ id: state.nextId++, pos: { x: pos.x, y }, text, kind, age: 0, chainId, total })
  if (state.popups.length > MAX_POPUPS) state.popups.shift()
}

// Scores a kill at pos and counts it toward its chain. A first kill pops up
// "+points"; each later kill in the same chain updates that chain's one
// popup in place to "CHAIN xN  +total" (the chain's points so far), holding
// it where it's shown now and resetting its timer, so it lingers after the
// chain ends.
export function scoreKill(state: GameState, pos: Vec, base: number, chainId: number | null, bonus = false): number {
  const killNumber = registerKill(state, chainId)
  const points = killPoints(base, state.wave, killNumber)
  state.score += points
  const popup = chainId === null ? undefined : state.popups.find((p) => p.chainId === chainId)
  if (killNumber >= 2 && popup) {
    popup.pos.y = Math.max(popupShownY(popup), state.hudBottom + STACK_STEP)
    popup.total += points
    popup.text = `CHAIN ×${chainMultiplier(killNumber)}  +${popup.total}`
    popup.kind = 'chain'
    popup.age = 0
  } else if (killNumber >= 2) {
    // The chain's popup has already faded out: start a new one here.
    addPopup(state, pos, `CHAIN ×${chainMultiplier(killNumber)}  +${points}`, 'chain', chainId, points)
  } else {
    addPopup(state, pos, `+${points}`, bonus ? 'bonus' : 'points', chainId, points)
  }
  return points
}
