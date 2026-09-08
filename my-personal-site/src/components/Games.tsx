import { CurrentlyLoving } from './games/CurrentlyLoving'
import { FavoritesList } from './games/FavoritesList'
import { WantToPlay } from './games/WantToPlay'
import { GameInventory } from './games/GameInventory'

export function Games() {
  return (
    <div className="min-h-screen bg-[var(--deep-space-black)] text-slate-200">
      <CurrentlyLoving />
      <FavoritesList />
      <WantToPlay />
      <GameInventory />
    </div>
  )
}
