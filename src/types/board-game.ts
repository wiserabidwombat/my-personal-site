export type BoardGame = {
  id: string
  name: string
  tags: string[]
  categories: string[]
  mechanics: string[]
  rating: number | null
  status: string | null
  condition: string | null
  owned: boolean
  playersMin: number | null
  playersMax: number | null
  playtimeMinutes: number | null
  minPlaytime: number | null
  maxPlaytime: number | null
  weight: number | null
  designer: string | null
  publisher: string | null
  yearPublished: number | null
  lastPlayed: string | null
  bggLink: string | null
  thumbnailUrl: string | null
  notes: string | null
  notes2: string | null
  notes3: string | null
  notionUrl: string
}
