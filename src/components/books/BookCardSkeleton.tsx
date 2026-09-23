import { Card, CardHeader } from '@/components/ui/card'

function Bar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />
}

// Mirrors BookCard's exact structure (cover image, title, author, meta row)
// and spacing classes, so the library grid doesn't shift or resize once
// real cards swap in.
export function BookCardSkeleton() {
  return (
    <Card className="gap-0 p-0 text-left ring-white/10">
      <div className="aspect-[2/3] w-full rounded-t-2xl skeleton-shimmer" aria-hidden="true" />

      <CardHeader className="gap-1.5 py-4">
        <Bar className="h-5 w-4/5" />
        <Bar className="h-3 w-1/2" />
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          <Bar className="h-3 w-10" />
          <Bar className="h-3 w-16" />
        </div>
      </CardHeader>
    </Card>
  )
}
