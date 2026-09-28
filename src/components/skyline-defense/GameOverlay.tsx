import { neonOutlineButton } from '../../lib/styles'
import { GameOverScreen } from './leaderboard/GameOverScreen'
import { Leaderboard } from './leaderboard/Leaderboard'
import { useLeaderboard } from './leaderboard/useLeaderboard'
import { Panel } from './Panel'
import type { GameUi } from './gameUi'
import { formatScore } from './formatScore'

type Props = {
  ui: GameUi
  onStart: () => void
  onResume: () => void
}

// Start, pause, and game-over screens, drawn over the canvas. The global
// Top 10 is fetched once here and shared by the start and game-over screens.
export function GameOverlay({ ui, onStart, onResume }: Props) {
  const leaderboard = useLeaderboard()

  if (ui.screen === 'start') {
    return (
      <Panel title="Defend Dallas">
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Meteors are falling on the skyline. Click or tap the sky to launch an interceptor from the nearest battery;
          its blast destroys any meteor it touches, and those set off blasts of their own.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Keyboard: arrow keys aim, Space fires, P pauses. Ammo refills each wave. Lose every building and it's over.
        </p>
        {ui.highScore > 0 && (
          <p className="mt-3 text-sm text-[var(--laser-cyan)]">Personal best: {formatScore(ui.highScore)}</p>
        )}
        <Leaderboard status={leaderboard.status} board={leaderboard.board} />
        <button type="button" autoFocus onClick={onStart} className={`${neonOutlineButton} mt-5`}>
          Start
        </button>
      </Panel>
    )
  }
  if (ui.screen === 'gameOver') {
    return (
      <GameOverScreen
        score={ui.score}
        wave={ui.wave}
        highScore={ui.highScore}
        newHighScore={ui.newHighScore}
        status={leaderboard.status}
        board={leaderboard.board}
        refresh={leaderboard.refresh}
        replace={leaderboard.replace}
        onPlayAgain={onStart}
      />
    )
  }
  if (ui.paused) {
    return (
      <Panel title="Paused">
        <p className="mt-3 text-sm text-slate-300">Press P or the button to keep going.</p>
        <button type="button" autoFocus onClick={onResume} className={`${neonOutlineButton} mt-5`}>
          Resume
        </button>
      </Panel>
    )
  }
  return null
}
