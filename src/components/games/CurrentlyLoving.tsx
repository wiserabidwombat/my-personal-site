import type { BoardGame } from '../../types/board-game'
import { headingClass } from './shared'
import { GameArt } from './GameArt'

const currentlyLoving = {
  name: 'Champions of Midgard',
  blurb: 'Viking worker-placement with a monster-hunting twist -- back on the table on repeat.',
}

type Props = {
  games: BoardGame[]
}

export function CurrentlyLoving({ games }: Props) {
  // Matched by name against the live data for its box art; the featured
  // card is a single image, so it uses the full-size art.
  const game = games.find((g) => g.name.toLowerCase() === currentlyLoving.name.toLowerCase())

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Currently Loving</h2>
      <div className="mt-6 rounded-3xl border-2 border-[var(--laser-cyan)] bg-[var(--deep-space-purple)]/40 p-8 text-center shadow-glow-cyan backdrop-blur-md">
        <GameArt
          name={currentlyLoving.name}
          src={game?.imageUrl ?? game?.thumbnailUrl}
          eager
          className="mx-auto mb-6 max-w-sm rounded-2xl"
        />
        <h3 className="text-xl font-bold text-slate-50">{currentlyLoving.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{currentlyLoving.blurb}</p>
      </div>
    </section>
  )
}
