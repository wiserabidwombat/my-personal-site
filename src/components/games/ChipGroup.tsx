import { cn } from 'cn'
import { outlinePill, outlinePillActive } from '../../lib/styles'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  label: string
  options: readonly Option<T>[]
  value: T | undefined
  onChange: (value: T | undefined) => void
  // Optional explicit "All" chip (e.g. Status). Without one, clicking the
  // active chip again clears the selection.
  allLabel?: string
}

const chipClass = cn(
  outlinePill,
  'cursor-pointer hover:bg-[var(--laser-cyan)]/10 focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-space-black)] focus-visible:outline-none',
)

// Single-select filter chips, styled like the Blog's tag chips.
export function ChipGroup<T extends string>({ label, options, value, onChange, allLabel }: Props<T>) {
  const chips: { value: T | undefined; label: string }[] = [
    ...(allLabel ? [{ value: undefined, label: allLabel }] : []),
    ...options,
  ]

  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-semibold tracking-wide text-slate-400 uppercase" aria-hidden="true">
        {label}
      </span>
      {chips.map((chip) => {
        const active = chip.value === value
        return (
          <button
            key={chip.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active && !allLabel ? undefined : chip.value)}
            className={cn(chipClass, active && outlinePillActive)}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
