import { gameCardBaseClass } from '../games/shared'

function Bar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />
}

// Mirrors BookCard's structure (2:3 cover, title, author, meta row) and
// spacing, so the library grid doesn't shift once real cards swap in.
export function BookCardSkeleton() {
  return (
    <div className={`${gameCardBaseClass} flex-col`}>
      <div className="aspect-[2/3] w-full skeleton-shimmer" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Bar className="h-4 w-4/5" />
        <Bar className="h-3 w-1/2" />
        <Bar className="mt-1 h-3 w-16" />
      </div>
    </div>
  )
}
