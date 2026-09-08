import { Badge } from '../../../@/components/ui/badge'
import { headingClass } from './shared'

const currentlyLoving = [
  {
    name: 'Champions of Midgard',
    category: 'Board Game',
    blurb: 'Viking worker-placement with a monster-hunting twist -- back on the table on repeat.',
  },
  {
    name: 'Heroes of Might and Magic: Olden Era',
    category: 'PC Game',
    blurb: 'Deep into the campaign, one more turn at a time.',
  },
]

export function CurrentlyLoving() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Currently Loving</h2>
      <div className="mt-6 rounded-3xl border-2 border-[var(--laser-cyan)] bg-[var(--deep-space-purple)]/40 p-8 shadow-glow-cyan backdrop-blur-md">
        <div className="grid gap-8 sm:grid-cols-2">
          {currentlyLoving.map((game) => (
            <div key={game.name}>
              <Badge variant="secondary" className="text-[10px]">
                {game.category}
              </Badge>
              <h3 className="mt-3 text-xl font-bold text-slate-50">{game.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{game.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
