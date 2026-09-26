import { cn } from 'cn'

const tabletSpan = ['', 'sm:col-span-1', 'sm:col-span-2']
const wideSpan = ['', 'lg:col-span-1', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-4']

// When a group's last row isn't full, its last card stretches across the
// leftover columns, so no row looks unfinished. Worked out separately for
// the 2-column tablet grid and the wider desktop grid.
export function lastCardSpan(count: number, wideColumns: number): string {
  const tabletLeft = count % 2
  const wideLeft = count % wideColumns
  const tablet = tabletLeft === 0 ? 1 : 2 - tabletLeft + 1
  const wide = wideLeft === 0 ? 1 : wideColumns - wideLeft + 1
  return cn(tablet > 1 && tabletSpan[tablet], (tablet > 1 || wide > 1) && wideSpan[wide])
}
