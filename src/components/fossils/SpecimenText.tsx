import { cn } from 'cn'
import type { Specimen } from '../../types/specimen'
import { isUnknownLocation, splitScientificName } from './specimenFormat'

// The display name with only its scientific part (from scientific_name)
// in italics -- e.g. *Phacops speculator* (pair).
export function SpecimenName({ specimen }: { specimen: Pick<Specimen, 'name' | 'scientificName'> }) {
  const parts = splitScientificName(specimen.name, specimen.scientificName)
  if (!parts) return <>{specimen.name}</>
  return (
    <>
      {parts.before}
      <i>{parts.italic}</i>
      {parts.after}
    </>
  )
}

// "Locality unknown" in muted text when the location is empty or "Unknown".
export function SpecimenLocation({ location, className }: { location: string | null; className?: string }) {
  if (isUnknownLocation(location)) {
    return <p className={cn(className, 'text-slate-500 italic')}>Locality unknown</p>
  }
  return <p className={className}>{location}</p>
}

// Small uppercase accent label for the specimen type (mineral / fossil).
export function TypeTag({ type }: { type: Specimen['type'] }) {
  return (
    <span className="w-fit text-[10px] font-semibold tracking-wider text-[var(--laser-cyan)] uppercase">{type}</span>
  )
}
