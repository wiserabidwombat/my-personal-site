import { Badge } from '../../../@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '../../../@/components/ui/card'
import { headingClass } from './shared'

const favorites = [
  { name: 'Eldritch Horror', category: 'Board Game' },
  { name: 'Champions of Midgard', category: 'Board Game' },
  { name: 'Horrified', category: 'Board Game' },
  { name: 'Heroes of Might and Magic: Olden Era', category: 'PC Game' },
]

export function FavoritesList() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Favorites</h2>
      <p className="mt-2 text-slate-300">All-time favorite PC and board games.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {favorites.map((game) => (
          <Card
            key={game.name}
            className="ring-white/10 transition-all duration-300 hover:ring-[var(--neon-pink)]/60 hover:shadow-glow-pink"
          >
            <CardHeader>
              <Badge variant="outline" className="w-fit text-[10px]">
                {game.category}
              </Badge>
              <CardTitle className="mt-2 text-base font-semibold text-slate-100">
                {game.name}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
