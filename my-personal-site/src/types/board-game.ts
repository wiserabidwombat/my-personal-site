export type BoardGame = {
  id: string
  name: string
  tags: string[]
  rating: number | null
  status: string | null
  owned: boolean
  playersMin: number | null
  playersMax: number | null
  playtimeMinutes: number | null
  designer: string | null
  publisher: string | null
  yearPublished: number | null
  lastPlayed: string | null
  bggLink: string | null
  notionUrl: string
}
