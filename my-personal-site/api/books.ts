import type { VercelRequest, VercelResponse } from '@vercel/node'

export type HardcoverUserBookRaw = {
  book_id: number
  rating: number | null
  read_count: number
  last_read_date: string | null
  starred: boolean
  book: {
    title: string
    pages: number | null
    image: { url: string } | null
    contributions: { author: { name: string } | null }[]
  }
}

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

const BOOKS_READ_QUERY = `
  query BooksRead($userId: Int!) {
    user_books(where: { user_id: { _eq: $userId }, status_id: { _eq: 3 } }) {
      book_id
      rating
      read_count
      last_read_date
      starred
      book {
        title
        pages
        image { url }
        contributions {
          author { name }
        }
      }
    }
  }
`

function joinAuthors(contributions: { author: { name: string } | null }[]): string {
  return contributions
    .map((contribution) => contribution.author?.name)
    .filter((name): name is string => Boolean(name))
    .join(', ')
}

export function mapUserBook(raw: HardcoverUserBookRaw): Book {
  return {
    hardcoverBookId: raw.book_id,
    title: raw.book.title,
    author: joinAuthors(raw.book.contributions),
    rating: raw.rating,
    pageCount: raw.book.pages,
    dateRead: raw.last_read_date,
    coverImageUrl: raw.book.image?.url ?? null,
    rereadCount: Math.max(raw.read_count - 1, 0),
    isFavorite: raw.starred,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { HARDCOVER_API_TOKEN, HARDCOVER_USER_ID } = process.env

  if (!HARDCOVER_API_TOKEN || !HARDCOVER_USER_ID) {
    res.status(500).json({ error: 'Hardcover is not configured on the server.' })
    return
  }

  try {
    const response = await fetch('https://api.hardcover.app/v1/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HARDCOVER_API_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'my-personal-site (aarontilley.me) books page',
      },
      body: JSON.stringify({
        query: BOOKS_READ_QUERY,
        variables: { userId: Number(HARDCOVER_USER_ID) },
      }),
    })

    if (!response.ok) {
      throw new Error(`Hardcover request failed: ${response.status}`)
    }

    const payload = (await response.json()) as {
      data?: { user_books: HardcoverUserBookRaw[] }
      errors?: { message: string }[]
    }

    if (payload.errors?.length) {
      throw new Error(payload.errors[0].message)
    }
    if (!payload.data) {
      throw new Error('Hardcover returned no data')
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    res.status(200).json({ books: payload.data.user_books.map(mapUserBook) })
  } catch (error) {
    console.error('Hardcover query failed', error)
    res.status(502).json({ error: 'Failed to load your book library.' })
  }
}
