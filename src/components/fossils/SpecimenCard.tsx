import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ImageNotFound01Icon } from '@hugeicons/core-free-icons'
import type { Specimen } from '../../types/specimen'
import { getResizedImageUrl } from '../../lib/image'
import { SpecimenDetailModal } from './SpecimenDetailModal'
import { SpecimenLocation, SpecimenName, TypeTag } from './SpecimenText'
import { specimenAlt, specimenCardClass } from './specimenFormat'

type Props = {
  specimen: Specimen
}

export function SpecimenCard({ specimen }: Props) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        onClick={() => setDetailOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setDetailOpen(true)
          }
        }}
        className={specimenCardClass}
      >
        {specimen.imageUrl ? (
          <img
            src={getResizedImageUrl(specimen.imageUrl, 'medium')}
            alt={specimenAlt(specimen)}
            loading="lazy"
            decoding="async"
            className="aspect-square w-full object-cover transition-[filter] duration-300 group-hover:brightness-110"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-[var(--deep-space-black)]/60">
            <HugeiconsIcon icon={ImageNotFound01Icon} strokeWidth={1.5} className="size-8 text-slate-500" aria-hidden="true" />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
          <TypeTag type={specimen.type} />
          <h3 className="text-sm font-semibold text-slate-50 sm:text-base">
            <SpecimenName specimen={specimen} />
          </h3>
          <SpecimenLocation location={specimen.locationFound} className="mt-auto text-xs text-slate-400" />
        </div>
      </div>

      <SpecimenDetailModal specimen={specimen} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  )
}
