import { Card, CardHeader } from '../../../@/components/ui/card'

function Bar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />
}

// Mirrors GameCard's exact structure (Card > CardHeader > title/link row,
// players/rating/status row, categories row, mechanics row) and spacing
// classes, so the loading grid doesn't shift or resize once real cards
// swap in.
export function GameCardSkeleton() {
  return (
    <Card className="ring-white/10">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Bar className="h-5 w-2/3" />
          <Bar className="size-4 shrink-0 rounded-full" />
        </div>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <Bar className="h-3 w-16" />
          <Bar className="h-3 w-14" />
          <Bar className="h-3 w-16" />
        </div>

        <div className="mt-3 space-y-2">
          <div>
            <Bar className="h-2.5 w-20" />
            <div className="mt-1.5 flex flex-wrap gap-1">
              <Bar className="h-5 w-16 rounded-full" />
              <Bar className="h-5 w-12 rounded-full" />
            </div>
          </div>
          <div>
            <Bar className="h-2.5 w-20" />
            <div className="mt-1.5 flex flex-wrap gap-1">
              <Bar className="h-5 w-14 rounded-full" />
              <Bar className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
