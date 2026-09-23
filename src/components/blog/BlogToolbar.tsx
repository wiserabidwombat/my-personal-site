import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Input } from '../../../@/components/ui/input'
import { tagLabel } from '../../lib/blog'
import { outlinePill, outlinePillActive } from '../../lib/styles'

type Props = {
  tags: string[]
  selectedTag: string | undefined
  onSelectTag: (tag: string | undefined) => void
  search: string
  onSearchChange: (value: string) => void
}

const chipClass = cn(
  outlinePill,
  'cursor-pointer hover:bg-[var(--laser-cyan)]/10 focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-space-black)] focus-visible:outline-none',
)

// Single-select tag chips (left) + search (right) on one row from md up;
// stacked with search first on mobile. DOM order is chips-then-search so
// keyboard order matches the desktop layout; order-first only moves search
// up visually below md.
export function BlogToolbar({ tags, selectedTag, onSelectTag, search, onSearchChange }: Props) {
  const chips: { value: string | undefined; label: string }[] = [
    { value: undefined, label: 'All' },
    ...tags.map((tag) => ({ value: tag, label: tagLabel(tag) })),
  ]

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
      <div role="group" aria-label="Filter posts by tag" className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = chip.value === selectedTag
          return (
            <button
              key={chip.label}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectTag(chip.value)}
              className={cn(chipClass, active && outlinePillActive)}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
      <div className="relative order-first w-full md:order-none md:w-64 md:shrink-0">
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search posts..."
          aria-label="Search posts"
          className="pl-9"
        />
      </div>
    </div>
  )
}
