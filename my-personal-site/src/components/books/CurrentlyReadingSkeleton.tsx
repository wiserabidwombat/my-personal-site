function Bar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />
}

// Mirrors CurrentlyReading's real card shape (small cover left, title/author
// right, in a bordered/glowing box) so the section doesn't jump in size once
// real data swaps in -- unlike before, when this section rendered nothing at
// all while loading.
export function CurrentlyReadingSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden rounded-2xl border-2 border-[var(--laser-cyan)]/30 bg-[var(--deep-space-purple)]/40 p-4 backdrop-blur-md">
      <div className="h-24 w-16 flex-none rounded-md skeleton-shimmer" aria-hidden="true" />
      <div className="flex flex-col justify-center gap-2">
        <Bar className="h-4 w-32" />
        <Bar className="h-3 w-20" />
      </div>
    </div>
  )
}
