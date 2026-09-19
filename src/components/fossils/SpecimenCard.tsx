import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ImageNotFound01Icon } from '@hugeicons/core-free-icons'
import { Card, CardHeader, CardTitle } from '../../../@/components/ui/card'
import { Badge } from '../../../@/components/ui/badge'
import type { Specimen } from '../../types/specimen'
import { getResizedImageUrl } from '../../lib/image'
import { SpecimenDetailModal } from './SpecimenDetailModal'

type Props = {
  specimen: Specimen
}

// Same clickable-card-opens-modal pattern as the board games GameCard: the
// whole card is the click target, and it owns its own modal open state.
export function SpecimenCard({ specimen }: Props) {
  const [detailOpen, setDetailOpen] = useState(false)
  const showImage = Boolean(specimen.imageUrl)

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setDetailOpen(true)
          }
        }}
        className="cursor-pointer gap-0 p-0 text-left ring-white/10 transition-all duration-300 hover:ring-[var(--laser-cyan)]/60 hover:shadow-glow-cyan"
      >
        {showImage ? (
          <img
            src={getResizedImageUrl(specimen.imageUrl!, 'medium')}
            alt={specimen.name}
            className="aspect-square w-full rounded-t-2xl object-cover"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-t-2xl bg-[var(--deep-space-black)]/60">
            <HugeiconsIcon
              icon={ImageNotFound01Icon}
              strokeWidth={1.5}
              className="size-8 text-slate-500"
              aria-hidden="true"
            />
          </div>
        )}

        <CardHeader className="gap-1.5 py-4">
          <Badge variant="secondary" className="w-fit text-[10px] capitalize">
            {specimen.type}
          </Badge>
          <CardTitle className="text-base font-semibold text-slate-100">{specimen.name}</CardTitle>
          {specimen.locationFound && (
            <p className="text-xs text-slate-400">{specimen.locationFound}</p>
          )}
        </CardHeader>
      </Card>

      <SpecimenDetailModal specimen={specimen} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  )
}
