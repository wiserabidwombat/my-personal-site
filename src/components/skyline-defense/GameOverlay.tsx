import type { ReactNode } from 'react'
import { neonOutlineButton } from '../../lib/styles'
import type { GameUi } from './useSkylineDefense'

type Props = {
  ui: GameUi
  onStart: () => void
  onResume: () => void
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--deep-space-black)]/70 p-4">
      <div
        role="dialog"
        aria-label={title}
        className="w-full max-w-sm rounded-2xl border border-[var(--neon-pink)]/50 bg-[var(--deep-space-purple)]/90 p-6 text-center shadow-glow-pink"
      >
        <h2 className="text-2xl font-extrabold tracking-wide text-[var(--neon-pink)] uppercase [text-shadow:var(--glow-pink)]">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

// Start, pause, and game-over screens, drawn over the canvas.
export function GameOverlay({ ui, onStart, onResume }: Props) {
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
        {ui.highScore > 0 && <p className="mt-3 text-sm text-[var(--laser-cyan)]">High score: {ui.highScore}</p>}
        <button type="button" autoFocus onClick={onStart} className={`${neonOutlineButton} mt-5`}>
          Start
        </button>
      </Panel>
    )
  }
  if (ui.screen === 'gameOver') {
    return (
      <Panel title="Game over">
        <p className="mt-3 text-slate-200">Score: {ui.score}</p>
        <p className="mt-1 text-sm text-[var(--laser-cyan)]">
          {ui.newHighScore ? 'New high score!' : `High score: ${ui.highScore}`}
        </p>
        <button type="button" autoFocus onClick={onStart} className={`${neonOutlineButton} mt-5`}>
          Play again
        </button>
      </Panel>
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
