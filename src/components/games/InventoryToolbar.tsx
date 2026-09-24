import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ChipGroup } from './ChipGroup'
import { MultiSelectFilter } from './MultiSelectFilter'
import {
  PLAYER_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TIME_OPTIONS,
  hasActiveFilters,
  type InventorySearch,
  type SortOption,
} from './inventoryFilters'

type Props = {
  search: InventorySearch
  update: (patch: Partial<InventorySearch>) => void
  clearFilters: () => void
  allCategories: string[]
  allMechanics: string[]
  // The random picker, rendered beside the search box.
  picker: ReactNode
}

const playerChips = PLAYER_OPTIONS.map((value) => ({ value, label: value }))
const without = (list: string[] | undefined, value: string) => {
  const next = (list ?? []).filter((v) => v !== value)
  return next.length ? next : undefined
}

export function InventoryToolbar({ search, update, clearFilters, allCategories, allMechanics, picker }: Props) {
  const tagBadges = [
    ...(search.categories ?? []).map((tag) => ({ key: `cat-${tag}`, tag, remove: () => update({ categories: without(search.categories, tag) }) })),
    ...(search.mechanics ?? []).map((tag) => ({ key: `mech-${tag}`, tag, remove: () => update({ mechanics: without(search.mechanics, tag) }) })),
  ]

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {picker}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search.q ?? ''}
              onChange={(event) => update({ q: event.target.value || undefined })}
              placeholder="Search games..."
              aria-label="Search games"
              className="pl-9"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Sort
            <select
              value={search.sort ?? 'rating'}
              onChange={(event) => {
                const sort = event.target.value as SortOption
                update({ sort: sort === 'rating' ? undefined : sort })
              }}
              className="h-9 rounded-4xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)] px-3 text-sm font-normal tracking-normal text-slate-200 normal-case focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <ChipGroup label="Players" options={playerChips} value={search.players} onChange={(players) => update({ players })} />
        <ChipGroup label="Time" options={TIME_OPTIONS} value={search.time} onChange={(time) => update({ time })} />
        <ChipGroup
          label="Status"
          options={STATUS_OPTIONS}
          value={search.status}
          onChange={(status) => update({ status })}
          allLabel="All"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {allCategories.length > 0 && (
          <MultiSelectFilter
            label="Categories"
            options={allCategories}
            selected={search.categories ?? []}
            onChange={(next) => update({ categories: next.length ? next : undefined })}
          />
        )}
        {allMechanics.length > 0 && (
          <MultiSelectFilter
            label="Mechanics"
            options={allMechanics}
            selected={search.mechanics ?? []}
            onChange={(next) => update({ mechanics: next.length ? next : undefined })}
          />
        )}
        {hasActiveFilters(search) && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-[var(--laser-cyan)] underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {tagBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tagBadges.map(({ key, tag, remove }) => (
            <Badge key={key} variant="secondary" render={<button type="button" onClick={remove} />} className="cursor-pointer gap-1 text-[10px]">
              {tag}
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-2.5" aria-hidden="true" />
              <span className="sr-only">(remove filter)</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
