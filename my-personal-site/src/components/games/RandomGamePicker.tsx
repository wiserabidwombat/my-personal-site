import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../@/components/ui/dialog'
import { Button } from '../../../@/components/ui/button'
import { Badge } from '../../../@/components/ui/badge'
import { Input } from '../../../@/components/ui/input'
import type { BoardGame } from '../../types/board-game'
import { usePickerFilterState } from './usePickerFilterState'
import { pickRandomGame } from './gameFilters'
import { SingleSelectFilter } from './SingleSelectFilter'
import { MinPlaytimeFilter } from './MinPlaytimeFilter'
import { MaxPlaytimeFilter } from './MaxPlaytimeFilter'
import { GameDetailContent } from './GameDetailContent'

type Props = {
  games: BoardGame[]
}

const triggerClass =
  'gap-2 border-[var(--laser-cyan)] text-[var(--laser-cyan)] hover:bg-[var(--laser-cyan)]/10 hover:shadow-glow-cyan'

function parsePlayerCount(raw: string): number | null {
  if (raw === '') return null
  const value = Number(raw)
  return Number.isNaN(value) ? null : Math.max(1, Math.trunc(value))
}

export function RandomGamePicker({ games }: Props) {
  const [open, setOpen] = useState(false)
  const [pickedGame, setPickedGame] = useState<BoardGame | null>(null)
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
    setPickedGame(null)
  }

  function handleOpenChange(nextOpen: boolean) {
    // Every open starts from a clean slate: no carried-over filters or pick
    // from a previous session with the picker.
    if (nextOpen) {
      clearAllFilters()
      setPickedGame(null)
    }
    setOpen(nextOpen)
  }

  function pick() {
    setPickedGame(pickRandomGame(filteredGames))
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
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={players ?? ''}
                  onChange={(event) => setPlayers(parsePlayerCount(event.target.value))}
                  placeholder="Number of Players"
                  className="w-40"
                />
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
              disabled={eligibleCount === 0}
              className={triggerClass}
            >
              {pickedGame ? '🎲 Pick Again' : '🎲 Pick!'}
            </Button>

            {pickedGame && (
              <div className="border-t border-[var(--cyber-purple)]/30 pt-6">
                <GameDetailContent game={pickedGame} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
