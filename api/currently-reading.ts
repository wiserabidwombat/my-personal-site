import type { VercelRequest, VercelResponse } from '@vercel/node'

export type HardcoverCurrentlyReadingRaw = {
  book_id: number
  book: {
    title: string
    image: { url: string } | null
    contributions: { author: { name: string } | null }[]
  }
}

export type CurrentlyReadingBook = {
  hardcoverBookId: number
  title: string
  author: string
  coverImageUrl: string | null
}

// Nests 4 levels deep (user_books -> book -> contributions -> author). Hardcover's
// docs list a not-yet-shipped "max query depth 3" limit on their 2026 roadmap; if it
// ships and breaks this, split into multiple top-level queries (still well under the
// 5-top-level-query cap) rather than restructuring the data model.
const CURRENTLY_READING_QUERY = `
  query CurrentlyReading($userId: Int!) {
    user_books(where: { user_id: { _eq: $userId }, status_id: { _eq: 2 } }) {
      book_id
      book {
        title
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

export function mapCurrentlyReading(raw: HardcoverCurrentlyReadingRaw): CurrentlyReadingBook {
  return {
    hardcoverBookId: raw.book_id,
    title: raw.book.title,
    author: joinAuthors(raw.book.contributions),
    coverImageUrl: raw.book.image?.url ?? null,
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
        query: CURRENTLY_READING_QUERY,
        variables: { userId: Number(HARDCOVER_USER_ID) },
      }),
    })

    if (!response.ok) {
      throw new Error(`Hardcover request failed: ${response.status}`)
    }

    const payload = (await response.json()) as {
      data?: { user_books: HardcoverCurrentlyReadingRaw[] }
      errors?: { message: string }[]
    }

    if (payload.errors?.length || !payload.data) {
      throw new Error(payload.errors?.[0]?.message ?? 'Hardcover returned no data')
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900')
    res.status(200).json({ books: payload.data.user_books.map(mapCurrentlyReading) })
  } catch (error) {
    console.error('Hardcover currently-reading query failed', error)
    // Deliberately different from api/books.ts: a transient failure here degrades to
    // an empty "currently reading" state (uncached, so it self-heals on the next
    // request) rather than a 502, since this section is decorative and low-stakes.
    res.status(200).json({ books: [] })
  }
}
