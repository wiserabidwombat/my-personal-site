import { neonOutlineButton } from '../../lib/styles'

type Props = {
  onClear: () => void
}

export function BlogEmptyState({ onClear }: Props) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-[var(--cyber-purple)]/60 bg-[var(--deep-space-purple)]/40 px-6 py-12 text-center">
      <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">Signal lost</p>
      <h2 className="mt-3 text-2xl font-bold text-[var(--neon-pink)]">No transmissions found</h2>
      <p className="mx-auto mt-3 max-w-prose text-slate-300">
        Nothing matches the current filters. Try a different search or tag, or clear the filters to see every post.
      </p>
      <button type="button" onClick={onClear} className={`mt-6 ${neonOutlineButton}`}>
        Clear filters
      </button>
    </div>
  )
}
