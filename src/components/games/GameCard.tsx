import { cn } from 'cn'
import type { BoardGame } from '../../types/board-game'
import { GameArt } from './GameArt'
import { GameDetailTrigger } from './GameDetailTrigger'
import { formatBggRating, formatPlaytime, formatRange } from './shared'

type Props = {
  game: BoardGame
}

// Inventory (and Favorites) card: box art with the status on its corner,
// the title at full width, and a stats row pinned to the bottom so cards in
// a row line up. Tighter padding and type below sm, where the grid is two
// columns.
export function GameCard({ game }: Props) {
  const played = game.status?.toLowerCase() === 'played'

  return (
    <GameDetailTrigger game={game} className="flex-col">
      {/* Status sits on the art's corner so the title gets the card's full
          width. Thumbnail (200x150) rather than the full-size image: a page
          of 24 originals would be ~15 MB. */}
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
              played ? 'border-[var(--laser-cyan)]/60 text-[var(--laser-cyan)]' : 'border-slate-500/60 text-slate-300',
            )}
          >
            {game.status}
          </span>
        )}
      </div>
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
        </dl>
      </div>
    </GameDetailTrigger>
  )
}
