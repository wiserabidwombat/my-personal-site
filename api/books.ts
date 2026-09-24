import type { VercelRequest, VercelResponse } from '@vercel/node'

type HardcoverContribution = {
  // Role on this book: null (or "Author") for authors, otherwise e.g.
  // "Narrator", "Translator", "Illustrator".
  contribution: string | null
  author: { name: string } | null
}

// Title, cover, and contributors exist on both the book (Hardcover's default
// record for the work) and the user's chosen edition. All nullable in the schema.
type HardcoverWorkFields = {
  title: string | null
  image: { url: string | null } | null
  contributions: HardcoverContribution[]
}

export type HardcoverUserBookRaw = {
  book_id: number
  rating: number | null
  read_count: number
  last_read_date: string | null
  starred: boolean
  book: HardcoverWorkFields & {
    slug: string | null
    pages: number | null
  }
  edition: (HardcoverWorkFields & { pages: number | null }) | null
}

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

// Nests 4 levels deep (user_books -> book/edition -> contributions -> author).
// Hardcover's docs list a not-yet-shipped "max query depth 3" limit on their
// 2026 roadmap; if it ships and breaks this, split into multiple top-level
// queries (still well under the 5-top-level-query cap) rather than
// restructuring the data model.
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
        slug
        pages
        image { url }
        contributions { contribution author { name } }
      }
      edition {
        title
        pages
        image { url }
        contributions { contribution author { name } }
      }
    }
  }
`

// Authors only -- narrators, translators, and cover artists are dropped. If
// every contributor has some other role, they're all kept rather than
// showing no one.
export function joinAuthors(contributions: HardcoverContribution[]): string {
  const named = contributions.filter((contribution) => contribution.author?.name)
  const authors = named.filter(
    (contribution) => contribution.contribution == null || contribution.contribution.toLowerCase() === 'author',
  )
  return (authors.length ? authors : named).map((contribution) => contribution.author!.name).join(', ')
}

const orNull = (value: string | null | undefined) => (value && value.trim() ? value.trim() : null)

// Book-level data is the default title, cover, and authors for the work;
// the user's edition is only a fallback for fields the book record lacks
// (a foreign-language or audio edition would otherwise leak in).
export function mapUserBook(raw: HardcoverUserBookRaw): Book {
  const { book, edition } = raw
  const slug = orNull(book.slug)
  return {
    hardcoverBookId: raw.book_id,
    title: orNull(book.title) ?? orNull(edition?.title) ?? 'Untitled',
    author: joinAuthors(book.contributions) || joinAuthors(edition?.contributions ?? []),
    rating: raw.rating,
    pageCount: book.pages ?? edition?.pages ?? null,
    dateRead: raw.last_read_date,
    coverImageUrl: orNull(book.image?.url) ?? orNull(edition?.image?.url),
    hardcoverUrl: slug ? `https://hardcover.app/books/${slug}` : null,
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
