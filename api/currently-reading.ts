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
  subtitle: string | null
  image: { url: string | null } | null
  contributions: HardcoverContribution[]
}

type HardcoverEdition = HardcoverWorkFields & {
  pages: number | null
  audio_seconds: number | null
}

export type HardcoverCurrentlyReadingRaw = {
  book_id: number
  book: HardcoverWorkFields & {
    slug: string | null
    pages: number | null
  }
  edition: HardcoverEdition | null
  // The latest read-through (at most one -- see the query's limit).
  user_book_reads: {
    progress_pages: number | null
    progress_seconds: number | null
    edition: Pick<HardcoverEdition, 'pages' | 'audio_seconds'> | null
  }[]
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

// Nests 4 levels deep (user_books -> book/edition -> contributions -> author).
// Hardcover's docs list a not-yet-shipped "max query depth 3" limit on their
// 2026 roadmap; if it ships and breaks this, split into multiple top-level
// queries (still well under the 5-top-level-query cap) rather than
// restructuring the data model.
const CURRENTLY_READING_QUERY = `
  query CurrentlyReading($userId: Int!) {
    user_books(where: { user_id: { _eq: $userId }, status_id: { _eq: 2 } }) {
      book_id
      book {
        title
        subtitle
        slug
        pages
        image { url }
        contributions { contribution author { name } }
      }
      edition {
        title
        subtitle
        pages
        audio_seconds
        image { url }
        contributions { contribution author { name } }
      }
      user_book_reads(order_by: { id: desc }, limit: 1) {
        progress_pages
        progress_seconds
        edition { pages audio_seconds }
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

function percent(done: number | null | undefined, total: number | null | undefined): number | null {
  if (!done || !total || total <= 0) return null
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)))
}

// Progress is logged as pages (or seconds, for audiobooks) against the
// edition being read, so the percentage uses that edition's length -- the
// read's own edition first, then the user's edition, then the book.
export function readingProgress(raw: HardcoverCurrentlyReadingRaw): number | null {
  const read = raw.user_book_reads[0]
  if (!read) return null
  const pages = read.edition?.pages ?? raw.edition?.pages ?? raw.book.pages
  const seconds = read.edition?.audio_seconds ?? raw.edition?.audio_seconds
  return percent(read.progress_pages, pages) ?? percent(read.progress_seconds, seconds)
}

// The edition chosen on Hardcover comes first -- it's picked deliberately,
// and the book-level record can carry a stray cover or a translated title.
// The book is the fallback for any field the edition lacks (some editions
// have no cover or no contributors). The subtitle follows whichever record
// supplied the title.
export function mapCurrentlyReading(raw: HardcoverCurrentlyReadingRaw): CurrentlyReadingBook {
  const { book, edition } = raw
  const editionTitle = orNull(edition?.title)
  const slug = orNull(book.slug)
  return {
    hardcoverBookId: raw.book_id,
    title: editionTitle ?? orNull(book.title) ?? 'Untitled',
    subtitle: editionTitle ? orNull(edition?.subtitle) : orNull(book.subtitle),
    author: joinAuthors(edition?.contributions ?? []) || joinAuthors(book.contributions),
    coverImageUrl: orNull(edition?.image?.url) ?? orNull(book.image?.url),
    hardcoverUrl: slug ? `https://hardcover.app/books/${slug}` : null,
    progressPercent: readingProgress(raw),
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
