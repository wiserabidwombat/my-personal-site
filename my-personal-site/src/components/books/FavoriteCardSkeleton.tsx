function Bar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />
}

// Mirrors FavoritesShowcase's real card shape (full-bleed cover on top,
// title/author below, in a bordered/glowing box).
export function FavoriteCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--neon-pink)]/30 bg-[var(--deep-space-purple)]/40 backdrop-blur-md">
      <div className="aspect-[2/3] w-full skeleton-shimmer" aria-hidden="true" />
      <div className="p-4">
        <Bar className="h-4 w-4/5" />
        <Bar className="mt-2 h-3 w-1/2" />
      </div>
    </div>
  )
}
