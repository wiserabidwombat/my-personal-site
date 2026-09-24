import { useMemo, useState, useSyncExternalStore } from 'react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import type { Specimen } from '../../types/specimen'
import { cn } from 'cn'
import { SparklesIcon } from '@hugeicons/core-free-icons'
import { SectionHeading } from '../SectionHeading'
import { pageContainer } from '../../lib/styles'
import { SpecimenLocation, SpecimenName, TypeTag } from './SpecimenText'
import { specimenAlt, specimenCardClass } from './specimenFormat'
import { getResizedImageUrl } from '../../lib/image'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { SpecimenDetailModal } from './SpecimenDetailModal'

// Matches the site's own sm breakpoint (the same one the desktop/tablet
// grid switches on via `sm:grid-cols-2`) -- below it, mobile gets the
// carousel; at or above it, the existing grid is untouched.
const MOBILE_QUERY = '(max-width: 639px)'

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

// Shared card markup for both the desktop/tablet grid and the mobile
// carousel. Both pass onClick to open the same detail modal.
function ShowcaseCard({
  specimen,
  spotlight,
  onClick,
}: {
  specimen: Specimen
  spotlight?: boolean
  onClick?: () => void
}) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      // Same restrained card as the Catalog Ledger (the old heavy magenta
      // border and glow are gone); text left-aligned like the rest of the site.
      className={cn(specimenCardClass, !onClick && 'cursor-default hover:translate-y-0')}
    >
      {specimen.imageUrl ? (
        <img
          src={getResizedImageUrl(specimen.imageUrl, 'thumbnail')}
          alt={specimenAlt(specimen)}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-[var(--deep-space-black)]/60 text-xs text-slate-500">
          No image
        </div>
      )}
      <div className={`flex flex-1 flex-col gap-1.5 ${spotlight ? 'p-5' : 'p-3'}`}>
        <TypeTag type={specimen.type} />
        <h3 className={spotlight ? 'text-xl font-bold text-slate-50' : 'text-sm font-semibold text-slate-50'}>
          <SpecimenName specimen={specimen} />
        </h3>
        <SpecimenLocation
          location={specimen.locationFound}
          className={cn('mt-auto', spotlight ? 'text-sm text-slate-300' : 'text-xs text-slate-400')}
        />
      </div>
    </div>
  )
}

function Bar({ className }: { className: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} aria-hidden="true" />
}

// Mirrors ShowcaseCard's exact structure and spacing (including the
// spotlight-vs-grid size difference) so neither the desktop grid nor the
// mobile carousel shifts once real specimens swap in. Bar heights match
// each real text element's line-height, so rows don't shift on swap-in.
function ShowcaseCardSkeleton({ spotlight }: { spotlight?: boolean }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50">
      <div className="skeleton-shimmer aspect-square w-full" aria-hidden="true" />
      <div className={`flex flex-1 flex-col gap-1.5 ${spotlight ? 'p-5' : 'p-3'}`}>
        <Bar className="h-3 w-12" />
        <Bar className={spotlight ? 'h-7 w-3/4' : 'h-5 w-2/3'} />
        <Bar className={spotlight ? 'h-5 w-1/2' : 'h-4 w-1/2'} />
      </div>
    </div>
  )
}

export function NeonShowcase({ specimens, loading }: Props) {
  const featured = useMemo(() => shuffle(specimens).slice(0, 5), [specimens])
  const isMobile = useMediaQuery(MOBILE_QUERY)
  // detailSpecimen is intentionally not cleared on close: it stays set to
  // the last-viewed specimen so the modal's own `open` prop (not
  // unmounting the modal) drives the close transition, matching how
  // SpecimenCard's always-mounted modal behaves.
  const [detailSpecimen, setDetailSpecimen] = useState<Specimen | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [api, setApi] = useState<CarouselApi>()
  // Embla is an external, subscribable system too -- same
  // useSyncExternalStore pattern as useMediaQuery, reading the current
  // slide directly during render instead of syncing state from an effect.
  const activeIndex = useSyncExternalStore(
    (onChange) => {
      if (!api) return () => {}
      api.on('select', onChange)
      return () => api.off('select', onChange)
    },
    () => api?.selectedScrollSnap() ?? 0,
    () => 0
  )

  function openDetail(specimen: Specimen) {
    setDetailSpecimen(specimen)
    setDetailOpen(true)
  }

  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <SectionHeading icon={SparklesIcon}>Neon Showcase</SectionHeading>
      <p className="mt-2 text-slate-300">Five random finds from the collection.</p>

      {loading &&
        (isMobile ? (
          <div className="mx-auto mt-8 max-w-sm">
            <ShowcaseCardSkeleton spotlight />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <ShowcaseCardSkeleton key={index} />
            ))}
          </div>
        ))}

      {!loading && featured.length === 0 && (
        <p className="mt-8 text-slate-400">No specimens in the collection yet.</p>
      )}

      {!loading &&
        featured.length > 0 &&
        (isMobile ? (
          <div className="mt-8">
            <Carousel setApi={setApi} opts={{ loop: true }} className="mx-auto max-w-sm">
              <CarouselContent>
                {featured.map((specimen) => (
                  <CarouselItem key={specimen.id}>
                    <ShowcaseCard specimen={specimen} spotlight onClick={() => openDetail(specimen)} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="mt-4 flex justify-center gap-2">
              {featured.map((specimen, index) => (
                <button
                  key={specimen.id}
                  type="button"
                  aria-label={`Go to slide ${index + 1} of ${featured.length}`}
                  aria-current={index === activeIndex}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'w-6 bg-[var(--laser-cyan)] shadow-glow-cyan'
                      : 'w-2 bg-[var(--cyber-purple)]/50 hover:bg-[var(--cyber-purple)]'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {featured.map((specimen) => (
              <ShowcaseCard key={specimen.id} specimen={specimen} onClick={() => openDetail(specimen)} />
            ))}
          </div>
        ))}

      {detailSpecimen && (
        <SpecimenDetailModal specimen={detailSpecimen} open={detailOpen} onOpenChange={setDetailOpen} />
      )}
    </section>
  )
}
