import { FireIcon } from '@hugeicons/core-free-icons'
import type { BoardGame } from '../../types/board-game'
import { currentlyLoving } from '../../data/currently-loving'
import { GameArt } from './GameArt'
import { GameDetailTrigger } from './GameDetailTrigger'
import { GameSection } from './GameSection'
import { Seasonal } from '../halloween/Seasonal'
import { findGameByName, formatBggRating, formatPlaytime, formatRange } from './shared'

type Props = {
  games: BoardGame[]
}

// Featured card: full-size box art beside the text from md up (stacked on
// mobile), like the Blog's featured post -- and without the old heavy cyan
// glow. It's a single image, so it uses the full-size art, loaded eagerly
// since it's the first thing on the page.
export function CurrentlyLoving({ games }: Props) {
  const game = findGameByName(games, currentlyLoving.name)

  return (
    <GameSection icon={FireIcon} title="Currently Loving" aside={<Seasonal sprite="headingSkeleton" />}>
      <GameDetailTrigger game={game} className="mt-6 flex-col md:grid md:grid-cols-2">
        <GameArt name={currentlyLoving.name} src={game?.imageUrl ?? game?.thumbnailUrl} eager className="md:h-full" />
        <div className="flex flex-col justify-center gap-3 p-5 md:p-8">
          <h3 className="text-xl font-bold text-slate-50 sm:text-2xl">{currentlyLoving.name}</h3>
          <p className="text-slate-300">{currentlyLoving.blurb}</p>
          {game && (
            <p className="text-xs text-slate-400">
              {formatRange(game.playersMin, game.playersMax)} players · {formatPlaytime(game)} · BGG rating{' '}
              {formatBggRating(game.rating)}
            </p>
          )}
        </div>
      </GameDetailTrigger>
    </GameSection>
  )
}
