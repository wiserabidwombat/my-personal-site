import { HugeiconsIcon } from '@hugeicons/react'
import { ImageNotFound01Icon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import type { Specimen } from '../../types/specimen'
import { getResizedImageUrl } from '../../lib/image'

type Props = {
  specimen: Specimen
}

// Full-bleed hero image at top (clipped to the dialog's own rounded corners
// by the scrolling wrapper's overflow-hidden, not rounded here), then name/
// type/location/description below. Mirrors the board games detail modal's
// accent typography and glow styling, not its thumbnail-beside-title
// layout -- specimens get a proper hero image instead.
export function SpecimenDetailContent({ specimen }: Props) {
  const showImage = Boolean(specimen.imageUrl)

  return (
    <div>
      {showImage ? (
        <img
          src={getResizedImageUrl(specimen.imageUrl!, 'large')}
          alt={specimen.name}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-[var(--deep-space-black)]/60">
          <HugeiconsIcon
            icon={ImageNotFound01Icon}
            strokeWidth={1.5}
            className="size-12 text-slate-500"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="grid gap-4 p-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]">
            {specimen.name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px] capitalize">
              {specimen.type}
            </Badge>
            {specimen.locationFound && (
              <span className="text-sm text-slate-300">{specimen.locationFound}</span>
            )}
          </div>
        </div>

        {specimen.description && (
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
              Description
            </p>
            <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-slate-300">
              {specimen.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
