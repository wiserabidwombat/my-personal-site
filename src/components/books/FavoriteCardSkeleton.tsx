import { gameCardBaseClass } from '../games/shared'

function Bar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />
}

// Mirrors FavoritesShowcase's real card shape (full-bleed 2:3 cover on top,
// title/author below).
export function FavoriteCardSkeleton() {
  return (
    <div className={`${gameCardBaseClass} flex-col`}>
      <div className="aspect-[2/3] w-full skeleton-shimmer" aria-hidden="true" />
      <div className="p-3">
        <Bar className="h-4 w-4/5" />
        <Bar className="mt-2 h-3 w-1/2" />
      </div>
    </div>
  )
}
