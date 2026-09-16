import { useMemo } from 'react'
import { Badge } from '../../../@/components/ui/badge'
import type { Specimen } from '../../types/specimen'
import { headingClass } from '../games/shared'
import { getResizedImageUrl } from '../../lib/image'

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

type Props = {
  specimens: Specimen[]
  loading: boolean
}

export function NeonShowcase({ specimens, loading }: Props) {
  const featured = useMemo(() => shuffle(specimens).slice(0, 5), [specimens])

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className={headingClass}>Neon Showcase</h2>
      <p className="mt-2 text-slate-300">Five random finds from the collection.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {loading &&
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/40"
            />
          ))}

        {!loading && featured.length === 0 && (
          <p className="col-span-full text-slate-400">No specimens in the collection yet.</p>
        )}

        {!loading &&
          featured.map((specimen) => (
            // No fixed aspect ratio on the card itself -- only the image is
            // locked to a ratio. The content block below sizes to whatever
            // the type/title/location actually need (grid's default
            // items-stretch still keeps every card in a row matched to the
            // tallest one), so a wrapping title or long location is never
            // clipped by a height the card refuses to grow past.
            <div
              key={specimen.id}
              className="flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--neon-pink)] bg-[var(--deep-space-purple)]/40 shadow-glow-pink backdrop-blur-md"
            >
              {specimen.imageUrl ? (
                <img
                  src={getResizedImageUrl(specimen.imageUrl, 'thumbnail')}
                  alt={specimen.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-[var(--deep-space-black)]/60 text-xs text-slate-500">
                  No image
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <Badge variant="secondary" className="w-fit text-[10px] capitalize">
                  {specimen.type}
                </Badge>
                <h3 className="text-base font-bold text-slate-50">{specimen.name}</h3>
                {specimen.locationFound && (
                  <p className="text-xs text-slate-300">{specimen.locationFound}</p>
                )}
              </div>
            </div>
          ))}
      </div>
    </section>
  )
}
