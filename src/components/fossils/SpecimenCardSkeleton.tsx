import { Card, CardHeader } from '../../../@/components/ui/card'

function Bar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />
}

// Mirrors SpecimenCard's exact structure (Card > image > CardHeader >
// badge/title/location) and spacing classes, so the Catalog Ledger grid
// doesn't shift or resize once real cards swap in. Same skeleton-shimmer
// utility (pink/cyan sweep) as the board games GameCardSkeleton, for a
// consistent loading treatment across the site.
export function SpecimenCardSkeleton() {
  return (
    <Card className="gap-0 p-0 ring-white/10">
      <div className="skeleton-shimmer aspect-square w-full rounded-t-2xl" aria-hidden="true" />
      <CardHeader className="gap-1.5 py-4">
        <Bar className="h-5 w-16 rounded-full" />
        {/* h-6/h-4 match text-base's and text-xs's actual line-heights
            (24px/16px) -- h-5/h-3 look close but run ~8px short across the
            two lines, enough to shift the whole grid row once real text
            (at its real line-height) swaps in. */}
        <Bar className="h-6 w-2/3" />
        <Bar className="h-4 w-1/2" />
      </CardHeader>
    </Card>
  )
}
