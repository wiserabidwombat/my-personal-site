import { Card, CardHeader, CardTitle } from '../../../@/components/ui/card'
import { headingClass } from './shared'

const favorites = ['Eldritch Horror', 'Champions of Midgard', 'Horrified']

export function FavoritesList() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Favorites</h2>
      <p className="mt-2 text-slate-300">All-time favorite board games.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {favorites.map((name) => (
          <Card
            key={name}
            className="text-left ring-white/10 transition-all duration-300 hover:ring-[var(--neon-pink)]/60 hover:shadow-glow-pink"
          >
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-100">{name}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
