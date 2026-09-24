function Bar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />
}

// Mirrors SpecimenCard's structure (square image, then type tag, name, and
// location) and spacing, so the Catalog Ledger grid doesn't shift once real
// cards swap in. Same skeleton-shimmer utility as the board games cards.
export function SpecimenCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50">
      <div className="skeleton-shimmer aspect-square w-full" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <Bar className="h-3 w-12" />
        <Bar className="h-5 w-2/3 sm:h-6" />
        <Bar className="h-4 w-1/2" />
      </div>
    </div>
  )
}
