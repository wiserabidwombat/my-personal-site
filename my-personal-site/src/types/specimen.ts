export type SpecimenType = 'mineral' | 'fossil'

export type Specimen = {
  id: number
  name: string
  type: SpecimenType
  dateCollected: string | null
  locationFound: string | null
  description: string | null
  imageUrl: string | null
}
