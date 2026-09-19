export type SpecimenType = 'mineral' | 'fossil'

export type Specimen = {
  id: number
  name: string
  type: SpecimenType
  locationFound: string | null
  description: string | null
  imageUrl: string | null
}
