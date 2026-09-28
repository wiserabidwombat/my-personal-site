import type { BoardEntry } from './api'
import type { BoardStatus } from './useLeaderboard'
import { formatScore } from '../formatScore'

type Props = {
  status: BoardStatus
  board: BoardEntry[]
  // The id of the player's own entry, highlighted.
  highlightId?: number | null
}

// The global Top 10 as a compact table. While loading it says so; when the
// board isn't available (e.g. local dev without the API) it shows nothing.
export function Leaderboard({ status, board, highlightId = null }: Props) {
  if (status === 'unavailable') return null
  return (
    <section aria-label="Top 10" className="mt-5">
      <h3 className="text-xs font-bold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">Top 10</h3>
      {status === 'loading' ? (
        <p className="mt-2 text-sm text-slate-400" role="status">
          Loading the Top 10...
        </p>
      ) : board.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">No scores yet. Be the first.</p>
      ) : (
        <table className="mx-auto mt-2 w-full max-w-64 [font-family:var(--mono)] text-sm tabular-nums">
          <thead className="sr-only">
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Initials</th>
              <th scope="col">Score</th>
            </tr>
          </thead>
          <tbody>
            {board.map((entry) => {
              const mine = highlightId !== null && entry.id === highlightId
              // Every row has the same inline padding on its outer cells, and
              // the highlight sits on the cells (not the row), so it lines up
              // exactly with the rank and score columns at any width.
              const cell = `py-0.5 ${mine ? 'bg-[var(--laser-cyan)]/10' : ''}`
              return (
                <tr
                  key={`${entry.rank}-${entry.initials}-${entry.score}`}
                  className={mine ? 'text-[var(--laser-cyan)]' : 'text-slate-200'}
                  aria-current={mine ? 'true' : undefined}
                >
                  <td className={`${cell} rounded-l pr-3 pl-2 text-right ${mine ? '' : 'text-slate-400'}`}>
                    {entry.rank}.
                  </td>
                  <td className={`${cell} text-left tracking-[0.2em]`}>{entry.initials}</td>
                  <td className={`${cell} rounded-r pr-2 pl-3 text-right`}>{formatScore(entry.score)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}
