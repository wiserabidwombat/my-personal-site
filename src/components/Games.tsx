import { useBoardGames } from '../hooks/useBoardGames'
import { CurrentlyLoving } from './games/CurrentlyLoving'
import { FavoritesList } from './games/FavoritesList'
import { WantToPlay } from './games/WantToPlay'
import { GameInventory } from './games/GameInventory'

export function Games() {
  // Fetched once here (not inside GameInventory) so FavoritesList can match
  // its hardcoded names against the same real game records without a
  // second, redundant request.
  const { games, source } = useBoardGames()

  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
      <CurrentlyLoving games={games} />
      <FavoritesList games={games} />
      <WantToPlay />
      <GameInventory games={games} source={source} />
    </div>
  )
}
