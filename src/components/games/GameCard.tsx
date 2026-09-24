import { useState } from 'react'
import { cn } from 'cn'
import type { BoardGame } from '../../types/board-game'
import { GameDetailModal } from './GameDetailModal'
import { GameArt } from './GameArt'
import { formatBggRating, formatPlaytime, formatRange, gameCardClass } from './shared'

type Props = {
  game: BoardGame
}

// The whole card is one target that opens the detail dialog (which has the
// BGG link, notes, and full stats), so nothing interactive is nested inside
// it. The stats row is pinned to the bottom so cards in a row line up.
export function GameCard({ game }: Props) {
  const [detailOpen, setDetailOpen] = useState(false)
  const played = game.status?.toLowerCase() === 'played'

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        onClick={() => setDetailOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setDetailOpen(true)
          }
        }}
        className={gameCardClass}
      >
        {/* Thumbnail (200x150) rather than the full-size image: a page of 24
            originals would be ~15 MB. */}
        {/* Status sits on the art's corner so the title gets the card's full
            width instead of wrapping beside a badge. */}
        <div className="relative">
          <GameArt
            name={game.name}
            src={game.thumbnailUrl ?? game.imageUrl}
            className="transition-[filter] duration-300 group-hover:brightness-110"
          />
          {game.status && (
            <span
              className={cn(
                'absolute top-2 left-2 rounded-full border bg-[var(--deep-space-black)]/85 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm',
                played
                  ? 'border-[var(--laser-cyan)]/60 text-[var(--laser-cyan)]'
                  : 'border-slate-500/60 text-slate-300',
              )}
            >
              {game.status}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="font-semibold text-slate-50">{game.name}</h3>
          <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
            <div>
              <dt className="sr-only">Players</dt>
              <dd>{formatRange(game.playersMin, game.playersMax)} players</dd>
            </div>
            <div>
              <dt className="sr-only">Playtime</dt>
              <dd>{formatPlaytime(game)}</dd>
            </div>
            <div className="flex gap-1">
              <dt className="text-slate-500">BGG rating</dt>
              <dd>{formatBggRating(game.rating)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <GameDetailModal game={game} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  )
}
