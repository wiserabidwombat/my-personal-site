export type Book = {
  hardcoverBookId: number
  title: string
  author: string
  rating: number | null
  pageCount: number | null
  dateRead: string | null
  coverImageUrl: string | null
  hardcoverUrl: string | null
  rereadCount: number
  isFavorite: boolean
}

export type CurrentlyReadingBook = {
  hardcoverBookId: number
  title: string
  subtitle: string | null
  author: string
  coverImageUrl: string | null
  hardcoverUrl: string | null
  // Whole-number percent (0-100), or null when no progress is logged.
  progressPercent: number | null
}
