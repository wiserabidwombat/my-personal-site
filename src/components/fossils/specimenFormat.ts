import { cn } from 'cn'
import type { Specimen } from '../../types/specimen'

export function isUnknownLocation(location: string | null): boolean {
  return !location || /^\s*unknown\s*$/i.test(location)
}

// Photo alt text: the cleaned-up image caption when there is one (see
// api/fossils.ts imageAltText), otherwise the specimen's name and type.
export function specimenAlt(specimen: Pick<Specimen, 'name' | 'type' | 'imageAlt'>): string {
  return specimen.imageAlt ?? `${specimen.name}, ${specimen.type}`
}

// Splits a display name around its scientific (binomial or genus) part so
// only that part is italicized: "Phacops speculator (pair)" with
// scientificName "Phacops speculator" -> italic + " (pair)". No match (or
// no scientific name) renders the whole name upright.
export function splitScientificName(
  name: string,
  scientificName: string | null,
): { before: string; italic: string; after: string } | null {
  if (!scientificName) return null
  const index = name.toLowerCase().indexOf(scientificName.toLowerCase())
  if (index === -1) return null
  return {
    before: name.slice(0, index),
    italic: name.slice(index, index + scientificName.length),
    after: name.slice(index + scientificName.length),
  }
}

// Country is the last comma-separated part of a location. US localities
// often end in a state instead ("Red Cloud Mine, Arizona"), so US state
// names count as the USA.
const US_STATES = new Set(
  'Alabama Alaska Arizona Arkansas California Colorado Connecticut Delaware Florida Georgia Hawaii Idaho Illinois Indiana Iowa Kansas Kentucky Louisiana Maine Maryland Massachusetts Michigan Minnesota Mississippi Missouri Montana Nebraska Nevada New_Hampshire New_Jersey New_Mexico New_York North_Carolina North_Dakota Ohio Oklahoma Oregon Pennsylvania Rhode_Island South_Carolina South_Dakota Tennessee Texas Utah Vermont Virginia Washington West_Virginia Wisconsin Wyoming'
    .split(' ')
    .map((state) => state.replace(/_/g, ' ').toLowerCase()),
)

export function countryOf(location: string | null): string | null {
  if (isUnknownLocation(location)) return null
  const last = location!.split(',').at(-1)!.trim()
  if (!last) return null
  if (/^(usa|u\.s\.a\.?|united states( of america)?)$/i.test(last) || US_STATES.has(last.toLowerCase())) return 'USA'
  return last
}

export function collectionSummary(specimens: Specimen[]) {
  const countries = new Set(specimens.map((s) => countryOf(s.locationFound)).filter(Boolean))
  return {
    total: specimens.length,
    minerals: specimens.filter((s) => s.type === 'mineral').length,
    fossils: specimens.filter((s) => s.type === 'fossil').length,
    countries: countries.size,
  }
}

// Restrained card, matching the Board Games cards: one purple border, a
// slight lift and brighter border on hover or keyboard focus, a cyan focus
// ring, and equal heights in a row. The whole card opens the detail dialog.
export const specimenCardClass = cn(
  'group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 text-left transition duration-300',
  'hover:-translate-y-1 hover:border-[var(--laser-cyan)]/70 motion-reduce:hover:translate-y-0',
  'focus-visible:-translate-y-1 focus-visible:border-[var(--laser-cyan)]/70 focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-space-black)] focus-visible:outline-none',
)
