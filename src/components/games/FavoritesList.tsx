import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import type { BoardGame } from '../../types/board-game'
import { headingClass } from './shared'
import { GameDetailModal } from './GameDetailModal'
import { GameArt } from './GameArt'

const favorites = [
  'Eldritch Horror',
  'Champions of Midgard',
  'Horrified',
  'The Quacks of Quedlinburg',
]

function findGameByName(games: BoardGame[], name: string): BoardGame | undefined {
  const query = name.toLowerCase()
  return games.find((game) => game.name.toLowerCase() === query)
}

// Mirrors GameCard's "card owns its own modal" pattern, but only when a
// matching game record was found -- without one there's no data for the
// modal to show, so the card falls back to a plain, non-interactive tile.
function FavoriteCard({ name, game }: { name: string; game: BoardGame | undefined }) {
  const [detailOpen, setDetailOpen] = useState(false)

  if (!game) {
    return (
      <Card className="h-full pt-0 text-left ring-white/10">
        <GameArt name={name} src={null} />
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-100">{name}</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setDetailOpen(true)
          }
        }}
        className="h-full cursor-pointer pt-0 text-left ring-white/10 transition-all duration-300 hover:ring-[var(--laser-cyan)]/60 hover:shadow-glow-cyan"
      >
        <GameArt name={name} src={game.thumbnailUrl ?? game.imageUrl} />
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-100">{name}</CardTitle>
        </CardHeader>
      </Card>

      <GameDetailModal game={game} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  )
}

type Props = {
  games: BoardGame[]
}

export function FavoritesList({ games }: Props) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Favorites</h2>
      <p className="mt-2 text-slate-300">All-time favorite board games.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {favorites.map((name) => (
          <FavoriteCard key={name} name={name} game={findGameByName(games, name)} />
        ))}
      </div>
    </section>
  )
}
