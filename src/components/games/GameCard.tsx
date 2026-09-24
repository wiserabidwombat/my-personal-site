import { cn } from 'cn'
import type { BoardGame } from '../../types/board-game'
import { GameArt } from './GameArt'
import { GameDetailTrigger } from './GameDetailTrigger'
import { formatBggRating, formatPlaytime, formatRange } from './shared'

type Props = {
  game: BoardGame
}

// Inventory (and Favorites) card: box art, the title at full width, and a
// stats row (players, playtime, BGG rating, status badge) pinned to the
// bottom so cards in a row line up. Tighter padding and type below sm,
// where the grid is two columns.
export function GameCard({ game }: Props) {
  const played = game.status?.toLowerCase() === 'played'

  return (
    <GameDetailTrigger game={game} className="flex-col">
      {/* Thumbnail (200x150) rather than the full-size image: a page of 24
          originals would be ~15 MB. */}
      <GameArt
        name={game.name}
        src={game.thumbnailUrl ?? game.imageUrl}
        className="transition-[filter] duration-300 group-hover:brightness-110"
      />
      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
        <h3 className="text-sm font-semibold text-slate-50 sm:text-base">{game.name}</h3>
        <dl className="mt-auto flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-300 sm:gap-x-4 sm:text-xs">
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
          {/* Status lives here, not over the art, so it never covers a cover. */}
          {game.status && (
            <div>
              <dt className="sr-only">Status</dt>
              <dd
                className={cn(
                  'rounded-full border px-1.5 leading-4',
                  played ? 'border-[var(--laser-cyan)]/60 text-[var(--laser-cyan)]' : 'border-slate-500/60 text-slate-400',
                )}
              >
                {game.status}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </GameDetailTrigger>
  )
}
