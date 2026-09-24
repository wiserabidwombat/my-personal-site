import { gameCardBaseClass } from '../games/shared'

function Bar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />
}

// Mirrors CurrentlyReading's real card shape (2:3 cover left, title,
// subtitle, and author right) so the section doesn't jump in size once real
// data swaps in.
export function CurrentlyReadingSkeleton() {
  return (
    <div className={`${gameCardBaseClass} gap-4 p-3`}>
      <div className="aspect-[2/3] w-24 flex-none self-start rounded-lg skeleton-shimmer sm:w-28" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <Bar className="h-5 w-4/5" />
        <Bar className="h-4 w-3/5" />
        <Bar className="mt-1 h-3 w-1/3" />
      </div>
    </div>
  )
}
