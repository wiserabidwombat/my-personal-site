import type { BoardGame } from '../../types/board-game'

// Interval before advancing to each successive frame of the "flicking
// through cards" animation -- fastest first, easing out toward the landing
// frame so the pick feels like it's settling rather than stopping abruptly.
// Sums to ~2.18s, inside the 1.5-2.5s target.
export const SPIN_FRAME_DELAYS = [80, 80, 90, 100, 120, 140, 170, 200, 240, 280, 320, 360]

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Builds the sequence of games flashed during the spin, always ending on
// `winner`. The winner is decided up front by the caller (a single call to
// pickRandomGame) -- this only produces the *visual* path leading up to it,
// so the animation can never introduce a second, different random outcome.
//
// Avoids repeating the same game on two consecutive frames whenever more
// than one eligible game exists, so a small eligible set (2-3 games) still
// reads as "cycling" rather than visibly freezing on a repeat.
export function buildSpinSequence(
  eligibleGames: BoardGame[],
  winner: BoardGame,
  frameCount: number = SPIN_FRAME_DELAYS.length,
): BoardGame[] {
  if (eligibleGames.length === 0) return [winner]

  const frames: BoardGame[] = []
  for (let i = 0; i < frameCount - 1; i++) {
    // The frame right before the winner needs the same no-repeat treatment
    // against `winner` itself, or the random-frame-to-winner boundary could
    // silently repeat a card even though no two *generated* frames do.
    const isLastBeforeWinner = i === frameCount - 2
    const previous = frames[frames.length - 1]
    let candidate: BoardGame
    do {
      candidate = eligibleGames[Math.floor(Math.random() * eligibleGames.length)]
    } while (
      eligibleGames.length > 1 &&
      ((previous && candidate.id === previous.id) || (isLastBeforeWinner && candidate.id === winner.id))
    )
    frames.push(candidate)
  }
  frames.push(winner)
  return frames
}
