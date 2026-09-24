import { neonOutlineButton } from '../../lib/styles'

type Props = {
  onClear: () => void
}

// Same treatment as the Blog's "No transmissions found" state.
export function InventoryEmptyState({ onClear }: Props) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-[var(--cyber-purple)]/60 bg-[var(--deep-space-purple)]/40 px-6 py-12 text-center">
      <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">Nothing on the table</p>
      <h3 className="mt-3 text-2xl font-bold text-[var(--neon-pink)]">No games match</h3>
      <p className="mx-auto mt-3 max-w-prose text-slate-300">
        Try a different search or fewer filters, or clear them to see the whole shelf.
      </p>
      <button type="button" onClick={onClear} className={`mt-6 ${neonOutlineButton}`}>
        Clear filters
      </button>
    </div>
  )
}
