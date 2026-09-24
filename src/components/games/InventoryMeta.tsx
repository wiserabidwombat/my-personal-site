import type { BoardGamesSource } from '../../hooks/useBoardGames'

const sourceLabel: Record<BoardGamesSource, string> = {
  loading: 'Loading inventory...',
  live: 'Live from Notion',
  cached: 'Showing cached data',
}

// Where the inventory data came from, shown on the section heading's line.
export function SourceIndicator({ source }: { source: BoardGamesSource }) {
  return (
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
  )
}

// BGG's XML API terms require attribution on public apps using its data.
export function BggAttribution() {
  return (
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
  )
}
