import { StarIcon } from '@hugeicons/core-free-icons'
import type { BoardGame } from '../../types/board-game'
import { GameArt } from './GameArt'
import { GameCard } from './GameCard'
import { GameDetailTrigger } from './GameDetailTrigger'
import { GameSection } from './GameSection'
import { findGameByName } from './shared'

const favorites = ['Eldritch Horror', 'Champions of Midgard', 'Horrified', 'Quacks: All-In Edition']

type Props = {
  games: BoardGame[]
}

// Same cards as the inventory (equal height, box art, stats). Names must
// match the Notion "Game" title exactly; a favorite that isn't in the data
// renders as a plain tile with the art placeholder, since there are no
// details to open.
export function FavoritesList({ games }: Props) {
  return (
    <GameSection icon={StarIcon} title="Favorites" description="All-time favorite board games.">
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {favorites.map((name) => {
          const game = findGameByName(games, name)
          return game ? (
            <GameCard key={name} game={game} />
          ) : (
            <GameDetailTrigger key={name} game={undefined} className="flex-col">
              <GameArt name={name} src={null} />
              <div className="p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-slate-50 sm:text-base">{name}</h3>
              </div>
            </GameDetailTrigger>
          )
        })}
      </div>
    </GameSection>
  )
}
