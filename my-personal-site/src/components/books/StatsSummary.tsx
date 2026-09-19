import type { Book } from '../../types/book'
import type { BooksStatus } from '../../hooks/useBooks'
import { computeBookStats } from './bookStats'
import { headingClass } from '../games/shared'

type Props = {
  books: Book[]
  status: BooksStatus
}

export function StatsSummary({ books, status }: Props) {
  const stats = status === 'live' ? computeBookStats(books) : null

  const tiles: { label: string; value: string }[] = [
    { label: 'Books Read', value: stats ? String(stats.totalRead) : '—' },
    { label: 'Read This Year', value: stats ? String(stats.readThisYear) : '—' },
    {
      label: 'Average Rating',
      value: stats?.averageRating != null ? `${stats.averageRating.toFixed(1)}/5` : '—',
    },
    { label: 'Most-Read Author', value: stats?.mostReadAuthor ?? '—' },
  ]

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Reading Stats</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-2xl border-2 border-[var(--cyber-purple)] bg-[var(--deep-space-purple)]/40 p-4 text-center shadow-glow-purple backdrop-blur-md"
          >
            <p className="text-2xl font-bold text-slate-100">{tile.value}</p>
            <p className="mt-1 text-xs tracking-wide text-slate-400 uppercase">{tile.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
