import { HugeiconsIcon } from '@hugeicons/react'
import { ImageNotFound01Icon } from '@hugeicons/core-free-icons'
import type { Specimen } from '../../types/specimen'
import { getResizedImageUrl } from '../../lib/image'
import { SpecimenLocation, SpecimenName, TypeTag } from './SpecimenText'
import { specimenAlt } from './specimenFormat'

type Props = {
  specimen: Specimen
}

function formatAcquired(value: string): string {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

// Full-bleed hero image at top (clipped to the dialog's rounded corners by
// the scrolling wrapper), then name, type, and location, a compact details
// grid, and notes. Like the Board Games dialog: accent labels, no title
// glow -- and fields without a value are left out rather than shown as "—".
export function SpecimenDetailContent({ specimen }: Props) {
  const details = [
    ['Period', specimen.geologicPeriod],
    ['Age', specimen.approximateAge],
    ['Formation', specimen.formation],
    ['Dimensions', specimen.dimensions],
    ['Acquired', specimen.acquired && formatAcquired(specimen.acquired)],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))

  return (
    <div>
      {specimen.imageUrl ? (
        <img
          src={getResizedImageUrl(specimen.imageUrl, 'large')}
          alt={specimenAlt(specimen)}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-[var(--deep-space-black)]/60">
          <HugeiconsIcon icon={ImageNotFound01Icon} strokeWidth={1.5} className="size-12 text-slate-500" aria-hidden="true" />
        </div>
      )}

      <div className="grid gap-5 p-6">
        <div>
          <TypeTag type={specimen.type} />
          <h2 className="mt-1 text-xl font-bold text-[var(--neon-pink)]">
            <SpecimenName specimen={specimen} />
          </h2>
          <SpecimenLocation location={specimen.locationFound} className="mt-1 text-sm text-slate-300" />
        </div>

        {details.length > 0 && (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">{label}</dt>
                <dd className="mt-0.5 text-sm text-slate-200">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {specimen.notes && (
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">Notes</p>
            <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-slate-300">{specimen.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
