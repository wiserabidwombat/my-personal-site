import { useEffect, useState } from 'react'
import { neonOutlineButton } from '../../../lib/styles'
import { loadInitials, saveInitials } from '../highScore'
import { Panel } from '../Panel'
import { submitScore, type BoardEntry } from './api'
import { InitialsEntry } from './InitialsEntry'
import { Leaderboard } from './Leaderboard'
import type { BoardStatus } from './useLeaderboard'
import { formatScore } from '../formatScore'
import { canSubmit } from '../testRun'

type Props = {
  score: number
  wave: number
  highScore: number
  newHighScore: boolean
  // Set for a dev-only test run (?wave=N): never submitted.
  testWave: number | null
  status: BoardStatus
  board: BoardEntry[]
  refresh: () => void
  replace: (board: BoardEntry[]) => void
  onPlayAgain: () => void
}

// Game over. With the global board available and a score that makes the
// Top 10, the player enters initials first; then the board shows with their
// row highlighted. Otherwise (or after Skip) it shows the score, the local
// personal best, and the board -- or, when the board isn't available, the
// local-only screen. A dev test run skips initials entry and says it
// wasn't saved.
export function GameOverScreen(props: Props) {
  const { score, wave, highScore, newHighScore, testWave, status, board, refresh, replace, onPlayAgain } = props
  const [decided, setDecided] = useState<'entry' | 'board' | null>(null)
  const [highlightId, setHighlightId] = useState<number | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch the current board (or reuse a recent fetch) once.
  useEffect(() => {
    refresh()
  }, [refresh])

  // Decide once the board has loaded: initials entry if the score makes it.
  const mode = decided ?? (status === 'ready' && canSubmit(testWave, score, board) ? 'entry' : 'board')

  const submit = async (initials: string) => {
    if (testWave !== null) return
    setBusy(true)
    setError(null)
    const result = await submitScore(initials, score, wave)
    setBusy(false)
    if (result.kind === 'saved') {
      saveInitials(initials)
      replace(result.board)
      setHighlightId(result.onBoard ? result.id : null)
      setNote(result.message)
      setDecided('board')
    } else {
      // Rejected initials, a rate limit, or a network error: stay on the
      // entry screen so the player can fix, retry, or skip.
      setError(result.error)
    }
  }

  if (mode === 'entry' && status === 'ready') {
    return (
      <InitialsEntry
        title="New high score"
        header={<p className="mt-2 [font-family:var(--mono)] text-2xl text-slate-50 tabular-nums">{formatScore(score)}</p>}
        start={loadInitials() ?? 'AAA'}
        busy={busy}
        error={error}
        onSubmit={submit}
        onSkip={() => setDecided('board')}
      />
    )
  }

  return (
    <Panel
      title="Game over"
      actions={
        <button type="button" autoFocus onClick={onPlayAgain} className={neonOutlineButton}>
          Play again
        </button>
      }
    >
      <p className="mt-3 text-slate-200">
        Score: <span className="[font-family:var(--mono)] tabular-nums">{formatScore(score)}</span>
      </p>
      <p className="mt-1 text-sm text-[var(--laser-cyan)]">
        {newHighScore ? 'New personal best!' : `Personal best: ${formatScore(highScore)}`}
      </p>
      {import.meta.env.DEV && testWave !== null && (
        <p className="mt-2 text-xs text-slate-400">Test run (started at wave {testWave}) - not saved</p>
      )}
      {note && <p className="mt-2 text-sm text-slate-400">{note}</p>}
      <Leaderboard status={status} board={board} highlightId={highlightId} />
    </Panel>
  )
}
