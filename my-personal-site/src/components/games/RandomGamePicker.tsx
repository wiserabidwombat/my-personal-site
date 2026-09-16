import { useEffect, useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, ImageNotFound01Icon } from '@hugeicons/core-free-icons'
import { motion, useReducedMotion } from 'motion/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../@/components/ui/dialog'
import { Button } from '../../../@/components/ui/button'
import { Badge } from '../../../@/components/ui/badge'
import type { BoardGame } from '../../types/board-game'
import { usePickerFilterState } from './usePickerFilterState'
import { pickRandomGame } from './gameFilters'
import { SPIN_FRAME_DELAYS, buildSpinSequence, sleep } from './spinAnimation'
import { SingleSelectFilter } from './SingleSelectFilter'
import { PlayerCountFilter } from './PlayerCountFilter'
import { MinPlaytimeFilter } from './MinPlaytimeFilter'
import { MaxPlaytimeFilter } from './MaxPlaytimeFilter'
import { GameDetailContent } from './GameDetailContent'

type Props = {
  games: BoardGame[]
}

const triggerClass =
  'gap-2 border-[var(--laser-cyan)] text-[var(--laser-cyan)] hover:bg-[var(--laser-cyan)]/10 hover:shadow-glow-cyan'

// Lightweight stand-in shown mid-spin: thumbnail + title only, cheap enough
// to swap every 80-360ms without jank. The full GameDetailContent (stats,
// categories, mechanics, forum search, etc.) only renders once the spin
// lands on the actual winner.
function SpinFrameCard({ game }: { game: BoardGame }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--cyber-purple)]/30 bg-[var(--deep-space-black)]/40 p-4">
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
      <p className="truncate text-lg font-bold text-[var(--laser-cyan)]">{game.name}</p>
    </div>
  )
}

export function RandomGamePicker({ games }: Props) {
  const shouldReduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [displayedGame, setDisplayedGame] = useState<BoardGame | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [resultToken, setResultToken] = useState(0)
  // Invalidates any in-flight spin loop when a newer pick starts, or the
  // filters/dialog reset underneath it, so a stale async loop never writes
  // state after the fact.
  const spinTokenRef = useRef(0)
  const {
    allCategories,
    allMechanics,
    category,
    setCategory,
    mechanic,
    setMechanic,
    players,
    setPlayers,
    minPlaytime,
    setMinPlaytime,
    maxPlaytime,
    setMaxPlaytime,
    filteredGames,
    hasActiveFilters,
    clearAllFilters,
  } = usePickerFilterState(games)

  const eligibleCount = filteredGames.length

  // Drop a stale pick the moment the active filters change underneath it,
  // so the displayed game never contradicts the filters currently shown.
  // Adjusted during render (same pattern GameInventory uses for its page
  // reset) rather than in an effect, which would cost an extra render pass.
  const filterSignature = JSON.stringify([category, mechanic, players, minPlaytime, maxPlaytime])
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature)
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature)
    setSpinning(false)
    setDisplayedGame(null)
  }

  // Invalidating spinTokenRef itself has to live in an effect rather than
  // the render-phase block above: mutating a ref during render is unsound
  // in React (even though this ref is a plain cancellation counter that's
  // never read for rendering). The state resets above already happen
  // synchronously during render, well before this effect or any pending
  // spin-loop `await sleep(...)` resumes, so there's no window where a
  // stale frame could reappear.
  useEffect(() => {
    spinTokenRef.current++
  }, [filterSignature])

  function handleOpenChange(nextOpen: boolean) {
    // Every open starts from a clean slate: no carried-over filters or pick
    // from a previous session with the picker.
    if (nextOpen) {
      clearAllFilters()
    }
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
      <Button type="button" variant="outline" onClick={() => handleOpenChange(true)} className={triggerClass}>
        🎲 Pick a Random Game
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full overflow-visible border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)] p-0 shadow-glow-purple sm:max-w-lg">
          <div className="grid max-h-[85vh] gap-6 overflow-y-auto rounded-4xl p-6 sm:-mr-3 sm:rounded-none sm:pr-9">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]">
                🎲 Random Game Picker
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {allCategories.length > 0 && (
                  <SingleSelectFilter
                    label="Category"
                    options={allCategories}
                    value={category}
                    onChange={setCategory}
                  />
                )}
                {allMechanics.length > 0 && (
                  <SingleSelectFilter
                    label="Mechanic"
                    options={allMechanics}
                    value={mechanic}
                    onChange={setMechanic}
                  />
                )}
                <PlayerCountFilter value={players} onChange={setPlayers} />
                <MinPlaytimeFilter value={minPlaytime} onChange={setMinPlaytime} />
                <MaxPlaytimeFilter value={maxPlaytime} onChange={setMaxPlaytime} />
                <button
                  type="button"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className="text-xs font-medium text-[var(--laser-cyan)] underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-40"
                >
                  Clear filters
                </button>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-1.5">
                  {category !== null && (
                    <Badge
                      variant="secondary"
                      onClick={() => setCategory(null)}
                      className="cursor-pointer gap-1 text-[10px] select-none"
                    >
                      {category}
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
                    </Badge>
                  )}
                  {mechanic !== null && (
                    <Badge
                      variant="secondary"
                      onClick={() => setMechanic(null)}
                      className="cursor-pointer gap-1 text-[10px] select-none"
                    >
                      {mechanic}
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
                    </Badge>
                  )}
                  {players !== null && (
                    <Badge
                      variant="secondary"
                      onClick={() => setPlayers(null)}
                      className="cursor-pointer gap-1 text-[10px] select-none"
                    >
                      {players} {players === 1 ? 'Player' : 'Players'}
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
                    </Badge>
                  )}
                  {minPlaytime !== null && (
                    <Badge
                      variant="secondary"
                      onClick={() => setMinPlaytime(null)}
                      className="cursor-pointer gap-1 text-[10px] select-none"
                    >
                      {minPlaytime}+ min
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
                    </Badge>
                  )}
                  {maxPlaytime !== null && (
                    <Badge
                      variant="secondary"
                      onClick={() => setMaxPlaytime(null)}
                      className="cursor-pointer gap-1 text-[10px] select-none"
                    >
                      Up to {maxPlaytime} min
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
                    </Badge>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-400">
                {eligibleCount === 0
                  ? 'No games match those filters — try loosening them up.'
                  : `${eligibleCount} game${eligibleCount === 1 ? '' : 's'} match${eligibleCount === 1 ? 'es' : ''}.`}
              </p>
            </div>

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
              <div className="border-t border-[var(--cyber-purple)]/30 pt-6">
                <SpinFrameCard game={displayedGame} />
              </div>
            )}

            {displayedGame && !spinning && (
              <motion.div
                key={`result-${displayedGame.id}-${resultToken}`}
                initial={shouldReduceMotion ? false : { scale: 0.94 }}
                animate={{
                  scale: 1,
                  boxShadow: [
                    '0 0 0px rgba(0, 240, 255, 0)',
                    '0 0 26px rgba(0, 240, 255, 0.55)',
                    '0 0 0px rgba(0, 240, 255, 0)',
                  ],
                }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="rounded-3xl border-t border-[var(--cyber-purple)]/30 pt-6"
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
