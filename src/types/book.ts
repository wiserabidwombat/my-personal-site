export type Book = {
  hardcoverBookId: number
  title: string
  author: string
  rating: number | null
  pageCount: number | null
  dateRead: string | null
  coverImageUrl: string | null
  rereadCount: number
  isFavorite: boolean
}

export type CurrentlyReadingBook = {
  hardcoverBookId: number
  title: string
  author: string
  coverImageUrl: string | null
}
