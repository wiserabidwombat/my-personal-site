import { cn } from 'cn'
import { pageContainer } from '../../lib/styles'

function Bar({ className }: { className: string }) {
  return <div className={cn('skeleton-shimmer rounded-md', className)} aria-hidden="true" />
}

// Stand-in for Recently Played and a cover grid while /api/spotify loads,
// with the same container, heading position, and spacing as the real
// sections so nothing jumps when data arrives.
export function MusicSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading music">
      <section className={cn(pageContainer, 'py-8 sm:py-10')}>
        <Bar className="h-7 w-48" />
        <div className="mt-4 grid grid-cols-1 gap-x-6 md:grid-cols-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 p-2">
              <Bar className="size-10 flex-none sm:size-11" />
              <div className="flex-1 space-y-1.5">
                <Bar className="h-3.5 w-3/5" />
                <Bar className="h-3 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className={cn(pageContainer, 'py-8 sm:py-10')}>
        <Bar className="h-7 w-40" />
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index}>
              <Bar className="aspect-square w-full" />
              <Bar className="mt-2 h-3.5 w-3/4" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
