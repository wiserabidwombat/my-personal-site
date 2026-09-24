function Bar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />
}

// Mirrors GameCard's structure (4:3 box art, title, stats row)
// and spacing, so the loading grid doesn't shift once real cards swap in.
export function GameCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50">
      <div className="skeleton-shimmer aspect-[4/3] w-full" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Bar className="h-5 w-2/3" />
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1">
          <Bar className="h-3 w-16" />
          <Bar className="h-3 w-12" />
          <Bar className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}
