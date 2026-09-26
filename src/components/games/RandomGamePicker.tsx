import { useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ImageNotFound01Icon } from '@hugeicons/core-free-icons'
import { motion, useReducedMotion } from 'motion/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { BoardGame } from '../../types/board-game'
import { pickRandomGame } from './gameFilters'
import { SPIN_FRAME_DELAYS, buildSpinSequence, sleep } from './spinAnimation'
import { GameDetailContent } from './GameDetailContent'

type Props = {
  // The inventory's currently filtered results: the picker only ever picks
  // from what the page's own filters (and search) show.
  games: BoardGame[]
}

const triggerClass =
  'gap-2 border-[var(--laser-cyan)] text-[var(--laser-cyan)] hover:bg-[var(--laser-cyan)]/10 hover:shadow-glow-cyan'

// Lightweight stand-in shown mid-spin: thumbnail + title only, cheap enough
// to swap every 80-360ms without jank. The full GameDetailContent (stats,
// categories, mechanics, forum search, etc.) only renders once the spin
// lands on the actual winner.
//
// A long title truncating correctly here isn't enough on its own: the
// outer wrapper below is `display: grid`, and CSS Grid sizes an auto
// column using the *min-content* contribution of every grid item -- for
// `white-space: nowrap` text (what `truncate` sets) that's the full
// unbroken text width, not the shrunk/truncated width. Left unchecked,
// that single long title silently widens the whole modal (every sibling
// grid item, including the Pick button, stretches to match), even though
// this card's own internal layout looks fine in isolation. Every
// `min-w-0` in this file below the grid wrapper is there specifically to
// stop that contribution from bubbling up -- removing any one of them
// reintroduces the overflow whenever the currently-cycling card happens
// to have a long name.
function SpinFrameCard({ game }: { game: BoardGame }) {
  return (
    // h-24 keeps this a fixed size regardless of title length, so the modal
    // never resizes/jumps as different games flash through. min-w-0 on the
    // title is load-bearing: flex items default to min-width:auto, so
    // without it a long, unbroken (nowrap, from `truncate`) title refuses
    // to shrink and blows out the row's width instead of eliding with "…".
    <div className="flex h-24 items-center gap-4 overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/30 bg-[var(--deep-space-black)]/40 p-4">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--deep-space-black)] ring-1 ring-[var(--cyber-purple)]/40">
        {game.thumbnailUrl ? (
          <img src={game.thumbnailUrl} alt="" className="size-full object-cover" />
        ) : (
          <HugeiconsIcon
            icon={ImageNotFound01Icon}
            strokeWidth={1.5}
            className="size-6 text-slate-500"
            aria-hidden="true"
          />
        )}
      </div>
      <p className="min-w-0 flex-1 truncate text-lg font-bold text-[var(--laser-cyan)]">{game.name}</p>
    </div>
  )
}

export function RandomGamePicker({ games }: Props) {
  const shouldReduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [displayedGame, setDisplayedGame] = useState<BoardGame | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [resultToken, setResultToken] = useState(0)
  // Invalidates any in-flight spin loop when a newer pick starts or the
  // dialog resets underneath it, so a stale async loop never writes
  // state after the fact.
  const spinTokenRef = useRef(0)
  const filteredGames = games
  const eligibleCount = filteredGames.length

  function handleOpenChange(nextOpen: boolean) {
    // Every open starts from a clean slate: no pick carried over from a
    // previous session with the picker.
    spinTokenRef.current++
    setSpinning(false)
    setDisplayedGame(null)
    setOpen(nextOpen)
  }

  async function pick() {
    const winner = pickRandomGame(filteredGames)
    if (!winner) return

    const token = ++spinTokenRef.current

    // Nothing meaningful to cycle through (0-1 eligible games) or the user
    // prefers reduced motion: reveal the result directly instead of
    // spinning through repeats of the same single card.
    if (shouldReduceMotion || filteredGames.length <= 1) {
      setSpinning(false)
      setDisplayedGame(winner)
      setResultToken((t) => t + 1)
      return
    }

    setSpinning(true)
    const frames = buildSpinSequence(filteredGames, winner)
    for (let i = 0; i < frames.length; i++) {
      if (spinTokenRef.current !== token) return // cancelled mid-spin
      setDisplayedGame(frames[i])
      await sleep(SPIN_FRAME_DELAYS[i])
    }

    if (spinTokenRef.current !== token) return // cancelled during the final delay
    setSpinning(false)
    setResultToken((t) => t + 1)
  }

  return (
    <>
      {/* aria-disabled (not disabled) keeps the button focusable so keyboard
          and screen-reader users still get the reason via the tooltip. */}
      <span className="group relative inline-flex">
        <Button
          type="button"
          variant="outline"
          aria-disabled={eligibleCount === 0}
          aria-describedby={eligibleCount === 0 ? 'random-picker-disabled-reason' : undefined}
          onClick={() => eligibleCount > 0 && handleOpenChange(true)}
          className={`${triggerClass} aria-disabled:cursor-not-allowed aria-disabled:opacity-50`}
        >
          🎲 Pick a Random Game
        </Button>
        {eligibleCount === 0 && (
          <span
            id="random-picker-disabled-reason"
            role="tooltip"
            className="pointer-events-none absolute top-full left-0 z-20 mt-2 w-56 rounded-md text-left border border-[var(--cyber-purple)]/50 bg-[var(--deep-space-black)] px-3 py-2 text-xs text-slate-300 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
          >
            No games match your current filters, so there's nothing to pick from.
          </span>
        )}
      </span>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full overflow-visible border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)] p-0 shadow-glow-purple sm:max-w-lg">
          <div
            className={`grid min-w-0 max-h-[85vh] gap-6 rounded-4xl p-6 sm:-mr-3 sm:rounded-none sm:pr-9 ${
              // Forced hidden (not auto/scroll) specifically while spinning,
              // so no scrollbar can appear even transiently as cards cycle
              // through -- the fixed-height SpinFrameCard above means there's
              // nothing that should need to scroll during the spin anyway.
              // Reverts to normal auto-scrolling once the spin lands, so the
              // final detail view (categories, notes, etc.) scrolls exactly
              // like the standalone game detail modal.
              spinning ? 'overflow-hidden' : 'overflow-y-auto'
            }`}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[var(--neon-pink)]">
                🎲 Random Game Picker
              </DialogTitle>
            </DialogHeader>

            <p className="text-xs text-slate-400">
              Picking from {eligibleCount} game{eligibleCount === 1 ? '' : 's'} matching your current filters.
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={pick}
              disabled={eligibleCount === 0 || spinning}
              className={triggerClass}
            >
              {spinning ? '🎲 Picking…' : displayedGame ? '🎲 Pick Again' : '🎲 Pick!'}
            </Button>

            {displayedGame && spinning && (
              <div className="min-w-0 border-t border-[var(--cyber-purple)]/30 pt-6">
                <SpinFrameCard game={displayedGame} />
              </div>
            )}

            {displayedGame && !spinning && (
              <motion.div
                key={`result-${displayedGame.id}-${resultToken}`}
                initial={shouldReduceMotion ? false : { scale: 0.94 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                // The reveal glow is a CSS animation (index.css) so its color
                // follows the theme tokens; the key remount restarts it.
                className="animate-result-glow min-w-0 rounded-3xl border-t border-[var(--cyber-purple)]/30 pt-6"
              >
                <GameDetailContent game={displayedGame} />
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
