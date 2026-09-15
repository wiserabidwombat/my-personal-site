import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../@/components/ui/dialog'
import { Button } from '../../../@/components/ui/button'
import { Badge } from '../../../@/components/ui/badge'
import type { BoardGame } from '../../types/board-game'
import { toggleValue } from './shared'
import { useGameFilterState } from './useGameFilterState'
import { pickRandomGame } from './gameFilters'
import { MultiSelectFilter } from './MultiSelectFilter'
import { MinPlayersFilter } from './MinPlayersFilter'
import { MaxPlayersFilter } from './MaxPlayersFilter'
import { MinPlaytimeFilter } from './MinPlaytimeFilter'
import { MaxPlaytimeFilter } from './MaxPlaytimeFilter'
import { GameDetailContent } from './GameDetailContent'

type Props = {
  games: BoardGame[]
}

const triggerClass =
  'gap-2 border-[var(--laser-cyan)] text-[var(--laser-cyan)] hover:bg-[var(--laser-cyan)]/10 hover:shadow-glow-cyan'

export function RandomGamePicker({ games }: Props) {
  const [open, setOpen] = useState(false)
  const [pickedGame, setPickedGame] = useState<BoardGame | null>(null)
  const {
    allCategories,
    allMechanics,
    selectedCategories,
    setSelectedCategories,
    selectedMechanics,
    setSelectedMechanics,
    minPlayers,
    setMinPlayers,
    maxPlayers,
    setMaxPlayers,
    minPlaytime,
    setMinPlaytime,
    maxPlaytime,
    setMaxPlaytime,
    filteredGames,
    hasActiveFilters,
    clearAllFilters,
  } = useGameFilterState(games)

  // Drop a stale pick the moment the active filters change underneath it,
  // so the displayed game never contradicts the filters currently shown.
  // Adjusted during render (same pattern GameInventory uses for its page
  // reset) rather than in an effect, which would cost an extra render pass.
  const filterSignature = JSON.stringify([
    selectedCategories,
    selectedMechanics,
    minPlayers,
    maxPlayers,
    minPlaytime,
    maxPlaytime,
  ])
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
                  <MultiSelectFilter
                    label="Categories"
                    options={allCategories}
                    selected={selectedCategories}
                    onChange={setSelectedCategories}
                  />
                )}
                {allMechanics.length > 0 && (
                  <MultiSelectFilter
                    label="Mechanics"
                    options={allMechanics}
                    selected={selectedMechanics}
                    onChange={setSelectedMechanics}
                  />
                )}
                <MinPlayersFilter value={minPlayers} onChange={setMinPlayers} />
                <MaxPlayersFilter value={maxPlayers} onChange={setMaxPlayers} />
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
                  {selectedCategories.map((tag) => (
                    <Badge
                      key={`cat-${tag}`}
                      variant="secondary"
                      onClick={() => setSelectedCategories((prev) => toggleValue(prev, tag))}
                      className="cursor-pointer gap-1 text-[10px] select-none"
                    >
                      {tag}
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
                    </Badge>
                  ))}
                  {selectedMechanics.map((tag) => (
                    <Badge
                      key={`mech-${tag}`}
                      variant="secondary"
                      onClick={() => setSelectedMechanics((prev) => toggleValue(prev, tag))}
                      className="cursor-pointer gap-1 text-[10px] select-none"
                    >
                      {tag}
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
                    </Badge>
                  ))}
                  {minPlayers !== null && (
                    <Badge
                      variant="secondary"
                      onClick={() => setMinPlayers(null)}
                      className="cursor-pointer gap-1 text-[10px] select-none"
                    >
                      {minPlayers}+ Players
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
                    </Badge>
                  )}
                  {maxPlayers !== null && (
                    <Badge
                      variant="secondary"
                      onClick={() => setMaxPlayers(null)}
                      className="cursor-pointer gap-1 text-[10px] select-none"
                    >
                      Up to {maxPlayers} Players
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
                {filteredGames.length} game{filteredGames.length === 1 ? '' : 's'} match
                {filteredGames.length === 1 ? 'es' : ''} these filters.
              </p>
            </div>

            {filteredGames.length === 0 ? (
              <p className="text-center text-sm text-slate-400">
                No games match those filters — try loosening them up.
              </p>
            ) : (
              <Button type="button" variant="outline" onClick={pick} className={triggerClass}>
                {pickedGame ? '🎲 Pick Again' : '🎲 Pick!'}
              </Button>
            )}

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
