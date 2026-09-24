export type SpecimenType = 'mineral' | 'fossil'

// Mirrors api/fossils.ts's Specimen. Every detail field is optional in the
// database (see db/migrations/003_add_specimen_details.sql) and null when
// unset; the UI hides null fields.
export type Specimen = {
  id: number
  name: string
  scientificName: string | null
  type: SpecimenType
  locationFound: string | null
  imageAlt: string | null
  imageUrl: string | null
  notes: string | null
  geologicPeriod: string | null
  approximateAge: string | null
  formation: string | null
  dimensions: string | null
  acquired: string | null
}
