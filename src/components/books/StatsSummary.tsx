import { cn } from 'cn'
import { ChartHistogramIcon } from '@hugeicons/core-free-icons'
import type { Book } from '../../types/book'
import type { BooksStatus } from '../../hooks/useBooks'
import { SectionHeading } from '../SectionHeading'
import { pageContainer } from '../../lib/styles'
import { computeBookStats } from './bookStats'

type Props = {
  books: Book[]
  status: BooksStatus
}

type Tile = { label: string; value: string }

// Left-aligned stat tiles with the site's restrained card border. The
// average-rating tile appears only once enough books are rated (see
// computeBookStats), and then carries its sample size.
export function StatsSummary({ books, status }: Props) {
  const stats = status === 'live' ? computeBookStats(books) : null

  const tiles: Tile[] = [
    { label: 'Books read', value: stats ? String(stats.totalRead) : '—' },
    { label: 'Read this year', value: stats ? String(stats.readThisYear) : '—' },
    ...(stats?.averageRating != null
      ? [{ label: `Avg rating · ${stats.ratedCount} rated`, value: stats.averageRating.toFixed(1) }]
      : []),
    { label: 'Most-read author', value: stats?.mostReadAuthor ?? '—' },
  ]

  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <SectionHeading icon={ChartHistogramIcon}>Reading Stats</SectionHeading>
      <dl className={cn('mt-6 grid grid-cols-2 gap-3 sm:gap-4', tiles.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3')}>
        {tiles.map((tile, index) => (
          <div
            key={tile.label}
            className={cn(
              'flex flex-col-reverse justify-end rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-4',
              // An odd tile count would leave the last tile alone in the
              // 2-column phone grid; let it take the full row instead.
              tiles.length % 2 === 1 && index === tiles.length - 1 && 'col-span-2 sm:col-span-1',
            )}
          >
            <dt className="mt-1 text-xs tracking-wide text-slate-400 uppercase">{tile.label}</dt>
            <dd className="text-xl font-bold break-words text-slate-100 sm:text-2xl">
              {status === 'loading' ? (
                <span className="block h-8 w-12 skeleton-shimmer rounded-md" aria-hidden="true" />
              ) : (
                tile.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
