import type { BoardGamesSource } from '../../hooks/useBoardGames'
import { headingClass } from './shared'

const sourceLabel: Record<BoardGamesSource, string> = {
  loading: 'Loading inventory...',
  live: 'Live from Notion',
  cached: 'Showing cached data',
}

// Inventory heading, the "Live from Notion" data-source indicator, and the
// BoardGameGeek attribution.
export function InventoryHeader({ source }: { source: BoardGamesSource }) {
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className={headingClass}>Game Inventory</h2>
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span
            className={`size-1.5 rounded-full ${
              source === 'live'
                ? 'bg-[var(--laser-cyan)] shadow-glow-cyan'
                : source === 'loading'
                  ? 'animate-pulse bg-slate-500'
                  : 'bg-slate-500'
            }`}
          />
          {sourceLabel[source]}
        </span>
      </div>
      <p className="mt-2 text-slate-300">Everything currently on the shelf.</p>
      {/* BGG's XML API terms require attribution on public apps using its data. */}
      <p className="mt-1 text-xs text-slate-500">
        Box art and ratings from{' '}
        <a
          href="https://boardgamegeek.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 underline underline-offset-2 hover:text-[var(--laser-cyan)]"
        >
          BoardGameGeek
        </a>
      </p>
    </>
  )
}
