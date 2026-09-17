import { useSpecimens } from '../hooks/useSpecimens'
import { NeonShowcase } from './fossils/NeonShowcase'
import { CatalogLedger } from './fossils/CatalogLedger'

export function Fossils() {
  const { specimens, status } = useSpecimens()
  const loading = status === 'loading'

  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      <NeonShowcase specimens={specimens} loading={loading} />
      <CatalogLedger specimens={specimens} loading={loading} status={status} />
      {status === 'error' && (
        <p className="mx-auto max-w-6xl px-6 pb-16 text-center text-sm text-slate-400">
          Unable to load the collection right now. Please try again later.
        </p>
      )}
    </div>
  )
}
