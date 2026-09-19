# Books Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/books` hobbies page that shows Aaron's Hardcover reading library, favorites, stats, and live currently-reading status — no local database, no import scripts.

**Architecture:** Two Vercel serverless functions (`api/books.ts`, `api/currently-reading.ts`) query Hardcover's GraphQL API live and return mapped JSON, mirroring `api/fossils.ts`'s live-query shape. A `useBooks` hook fetches the library once in a `Books.tsx` composition root that mirrors `Games.tsx`, passing data down to `CurrentlyReading`, `FavoritesShowcase`, `StatsSummary`, and `BookLibrary` — the same component-tree shape `games` already uses.

**Tech Stack:** React 19, TanStack Router, Vite, Tailwind CSS v4, shadcn/ui, Vercel Node functions (`@vercel/node`), Vitest.

**Spec:** [docs/superpowers/specs/2026-09-18-books-page-design.md](../specs/2026-09-18-books-page-design.md)

## Global Constraints

- Node `v20.19.0` (per `.nvmrc`) for any local command.
- Strict TypeScript — no `any`; define a type for every API payload/prop.
- Styling is Tailwind CSS v4 using only the existing `synthwave-ui` design tokens (`--neon-pink`, `--laser-cyan`, `--cyber-purple`, `--glow-*`) — no new colors or effects.
- No `// TODO` or placeholder code — every task's deliverable must be fully functional.
- Components over ~150 lines get split into smaller files (project convention, `.claude/claude.md`).
- Follow this repo's established import path conventions exactly: `@/components/ui/*` is imported as `'../../@/components/ui/...'` from a top-level `src/components/*.tsx` file (one more `../` from a nested subfolder like `src/components/books/*.tsx`), never via a `@/` alias import (the alias exists in `vite.config.ts` but is not how existing files under `src/components` reference it).
- `api/*.ts` files each define their own local types rather than importing from `src/types/*` — this duplicates a handful of fields but matches the existing `api/games.ts`/`api/fossils.ts` convention exactly; don't introduce a shared `api/lib/` module (not an existing pattern in this repo, and Vercel treats every file directly under `api/` as its own function route).

---

### Task 1: `api/books.ts` — full library endpoint

**Files:**
- Create: `api/books.ts`
- Test: `api/books.test.ts`

**Interfaces:**
- Produces (consumed by Task 3): `GET /api/books` → `{ books: Book[] }` JSON body, where `Book` (defined identically, separately, in `src/types/book.ts` in Task 3) is:
  ```ts
  type Book = {
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
  ```

Before writing code, confirm the query shape against the real API (resolves the spec's open item about `book.contributions[].author.name`):

- [ ] **Step 1: Get your Hardcover user ID**

Run (replace `$HARDCOVER_API_TOKEN` with your actual token — get one at https://hardcover.app/account/api if you don't have one handy):

```bash
curl -s https://api.hardcover.app/v1/graphql \
  -H "Authorization: Bearer $HARDCOVER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "User-Agent: my-personal-site (aarontilley.me) books page" \
  -d '{"query":"{ me { id username } }"}'
```

Expected: JSON like `{"data":{"me":{"id":12345,"username":"..."}}}`. Note the `id` — you'll use it as `HARDCOVER_USER_ID` in Task 9's env var setup, and as `$userId` below.

- [ ] **Step 2: Confirm the `user_books` query shape**

Run (substitute your real `id` from Step 1 for `12345`):

```bash
curl -s https://api.hardcover.app/v1/graphql \
  -H "Authorization: Bearer $HARDCOVER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -H "User-Agent: my-personal-site (aarontilley.me) books page" \
  -d '{"query":"query { user_books(where: {user_id: {_eq: 12345}, status_id: {_eq: 3}}) { book_id rating read_count last_read_date starred book { title pages image { url } contributions { author { name } } } } }"}'
```

Expected: a `data.user_books` array (empty is fine if nothing's marked "Read" yet — the spec noted the user has only a handful of books entered so far). Confirm the response has `book.contributions[].author.name` (not, say, a top-level `book.author` field) — if the shape differs from this, adjust the `HardcoverUserBookRaw` type in Step 3 below to match what you actually got back before proceeding.

- [ ] **Step 3: Write the failing test for the pure mapping function**

```ts
// api/books.test.ts
import { describe, expect, it } from 'vitest'
import { mapUserBook, type HardcoverUserBookRaw } from './books'

function makeRaw(overrides: Partial<HardcoverUserBookRaw> = {}): HardcoverUserBookRaw {
  return {
    book_id: 1,
    rating: 4.5,
    read_count: 1,
    last_read_date: '2026-03-14',
    starred: false,
    book: {
      title: 'Some Book',
      pages: 300,
      image: { url: 'https://assets.hardcover.app/cover.jpg' },
      contributions: [{ author: { name: 'Jane Author' } }],
    },
    ...overrides,
  }
}

describe('mapUserBook', () => {
  it('maps a single-author, single-read book', () => {
    const book = mapUserBook(makeRaw())
    expect(book).toEqual({
      hardcoverBookId: 1,
      title: 'Some Book',
      author: 'Jane Author',
      rating: 4.5,
      pageCount: 300,
      dateRead: '2026-03-14',
      coverImageUrl: 'https://assets.hardcover.app/cover.jpg',
      rereadCount: 0,
      isFavorite: false,
    })
  })

  it('computes rereadCount as read_count - 1, floored at 0', () => {
    expect(mapUserBook(makeRaw({ read_count: 3 })).rereadCount).toBe(2)
    expect(mapUserBook(makeRaw({ read_count: 0 })).rereadCount).toBe(0)
  })

  it('joins multiple contributors with a comma', () => {
    const raw = makeRaw({
      book: {
        ...makeRaw().book,
        contributions: [{ author: { name: 'First Author' } }, { author: { name: 'Second Author' } }],
      },
    })
    expect(mapUserBook(raw).author).toBe('First Author, Second Author')
  })

  it('skips a contribution with a null author', () => {
    const raw = makeRaw({
      book: {
        ...makeRaw().book,
        contributions: [{ author: { name: 'Real Author' } }, { author: null }],
      },
    })
    expect(mapUserBook(raw).author).toBe('Real Author')
  })

  it('maps a missing cover image to null', () => {
    const raw = makeRaw({ book: { ...makeRaw().book, image: null } })
    expect(mapUserBook(raw).coverImageUrl).toBeNull()
  })

  it('maps starred: true to isFavorite: true', () => {
    expect(mapUserBook(makeRaw({ starred: true })).isFavorite).toBe(true)
  })
})
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm test -- api/books.test.ts`
Expected: FAIL — `./books` has no exported member `mapUserBook` (the file doesn't exist yet).

- [ ] **Step 5: Implement `api/books.ts`**

```ts
// api/books.ts
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
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- api/books.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 7: Typecheck**

Run: `npx tsc -b tsconfig.api.json`
Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add api/books.ts api/books.test.ts
git commit -m "feat(books): add /api/books Hardcover library endpoint"
```

---

### Task 2: `api/currently-reading.ts` — live currently-reading endpoint

**Files:**
- Create: `api/currently-reading.ts`
- Test: `api/currently-reading.test.ts`

**Interfaces:**
- Consumes: nothing from Task 1 (fully independent — deliberately duplicates the small fetch/auth helper rather than sharing a module; see Global Constraints).
- Produces (consumed by Task 4): `GET /api/currently-reading` → `{ books: CurrentlyReadingBook[] }`, where `CurrentlyReadingBook` (defined identically, separately, in `src/types/book.ts` in Task 3) is:
  ```ts
  type CurrentlyReadingBook = {
    hardcoverBookId: number
    title: string
    author: string
    coverImageUrl: string | null
  }
  ```
- This endpoint never returns an HTTP error for a request/parse failure (only for a missing env var) — on any fetch/parse problem it logs and returns `{ books: [] }` with a 200, so the UI can render an empty state instead of an error banner for what is a low-stakes, decorative section.

- [ ] **Step 1: Write the failing test for the pure mapping function**

```ts
// api/currently-reading.test.ts
import { describe, expect, it } from 'vitest'
import { mapCurrentlyReading, type HardcoverCurrentlyReadingRaw } from './currently-reading'

function makeRaw(overrides: Partial<HardcoverCurrentlyReadingRaw> = {}): HardcoverCurrentlyReadingRaw {
  return {
    book_id: 7,
    book: {
      title: 'In Progress',
      image: { url: 'https://assets.hardcover.app/in-progress.jpg' },
      contributions: [{ author: { name: 'Cur Rent' } }],
    },
    ...overrides,
  }
}

describe('mapCurrentlyReading', () => {
  it('maps a book being currently read', () => {
    expect(mapCurrentlyReading(makeRaw())).toEqual({
      hardcoverBookId: 7,
      title: 'In Progress',
      author: 'Cur Rent',
      coverImageUrl: 'https://assets.hardcover.app/in-progress.jpg',
    })
  })

  it('maps a missing cover image to null', () => {
    const raw = makeRaw({ book: { ...makeRaw().book, image: null } })
    expect(mapCurrentlyReading(raw).coverImageUrl).toBeNull()
  })

  it('joins multiple contributors with a comma', () => {
    const raw = makeRaw({
      book: {
        ...makeRaw().book,
        contributions: [{ author: { name: 'First' } }, { author: { name: 'Second' } }],
      },
    })
    expect(mapCurrentlyReading(raw).author).toBe('First, Second')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- api/currently-reading.test.ts`
Expected: FAIL — module `./currently-reading` not found.

- [ ] **Step 3: Implement `api/currently-reading.ts`**

```ts
// api/currently-reading.ts
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

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900')

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

    res.status(200).json({ books: payload.data.user_books.map(mapCurrentlyReading) })
  } catch (error) {
    console.error('Hardcover currently-reading query failed', error)
    res.status(200).json({ books: [] })
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- api/currently-reading.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Typecheck**

Run: `npx tsc -b tsconfig.api.json`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add api/currently-reading.ts api/currently-reading.test.ts
git commit -m "feat(books): add /api/currently-reading Hardcover endpoint"
```

---

### Task 3: `src/types/book.ts` and `src/hooks/useBooks.ts`

**Files:**
- Create: `src/types/book.ts`
- Create: `src/hooks/useBooks.ts`

**Interfaces:**
- Consumes: the `{ books: Book[] }` JSON shape `GET /api/books` returns (Task 1) — `Book`'s fields here must exactly match Task 1's `Book` type.
- Produces (consumed by Tasks 4–7): `useBooks(): { books: Book[]; status: 'loading' | 'live' | 'error' }`, and the `Book`/`CurrentlyReadingBook` types every later task imports from `../types/book` (or `../../types/book` from a nested folder).

No test for this task — `src/types/book.ts` is a pure type declaration (nothing to assert), and `useBooks` is a thin `fetch` wrapper with no existing hook-test precedent in this repo (`useBoardGames`/`useSpecimens` are both untested; verified instead via the manual browser check in Task 8).

- [ ] **Step 1: Create `src/types/book.ts`**

```ts
// src/types/book.ts
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
```

- [ ] **Step 2: Create `src/hooks/useBooks.ts`**

```ts
// src/hooks/useBooks.ts
import { useEffect, useState } from 'react'
import type { Book } from '../types/book'

export type BooksStatus = 'loading' | 'live' | 'error'

export type BooksState = {
  books: Book[]
  status: BooksStatus
}

export function useBooks(): BooksState {
  const [state, setState] = useState<BooksState>({ books: [], status: 'loading' })

  useEffect(() => {
    let cancelled = false

    fetch('/api/books')
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return response.json() as Promise<{ books: Book[] }>
      })
      .then((data) => {
        if (!cancelled) setState({ books: data.books, status: 'live' })
      })
      .catch(() => {
        if (!cancelled) setState({ books: [], status: 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b tsconfig.app.json`
Expected: no errors (there are no consumers yet, so this only checks the two new files are internally well-typed)

- [ ] **Step 4: Commit**

```bash
git add src/types/book.ts src/hooks/useBooks.ts
git commit -m "feat(books): add Book types and useBooks hook"
```

---

### Task 4: `src/components/books/CurrentlyReading.tsx`

**Files:**
- Create: `src/components/books/CurrentlyReading.tsx`

**Interfaces:**
- Consumes: `CurrentlyReadingBook` from `../../types/book` (Task 3); fetches `/api/currently-reading` directly (Task 2) — no props.
- Produces (consumed by Task 8): `CurrentlyReading` — a self-contained component with no props.

No unit test — this component only orchestrates a `fetch` and renders JSX from the result; there's no pure logic to extract (unlike Tasks 6–7, which do have extractable pure functions). Verified visually in Task 8.

- [ ] **Step 1: Implement the component**

```tsx
// src/components/books/CurrentlyReading.tsx
import { useEffect, useState } from 'react'
import type { CurrentlyReadingBook } from '../../types/book'
import { getResizedImageUrl } from '../../lib/image'
import { headingClass } from '../games/shared'

type Status = 'loading' | 'live' | 'error'

export function CurrentlyReading() {
  const [books, setBooks] = useState<CurrentlyReadingBook[]>([])
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let cancelled = false

    fetch('/api/currently-reading')
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return response.json() as Promise<{ books: CurrentlyReadingBook[] }>
      })
      .then((data) => {
        if (!cancelled) {
          setBooks(data.books)
          setStatus('live')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'loading') return null

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Currently Reading</h2>
      {books.length === 0 ? (
        <p className="mt-2 text-slate-300">Not reading anything right now.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div
              key={book.hardcoverBookId}
              className="flex gap-4 overflow-hidden rounded-2xl border-2 border-[var(--laser-cyan)] bg-[var(--deep-space-purple)]/40 p-4 shadow-glow-cyan backdrop-blur-md"
            >
              {book.coverImageUrl && (
                <img
                  src={getResizedImageUrl(book.coverImageUrl, 'thumbnail')}
                  alt={`Cover of ${book.title}`}
                  loading="lazy"
                  className="h-24 w-16 flex-none rounded-md object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-slate-100">{book.title}</p>
                <p className="text-sm text-slate-400">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b tsconfig.app.json`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/books/CurrentlyReading.tsx
git commit -m "feat(books): add live CurrentlyReading section"
```

---

### Task 5: `src/components/books/bookStats.ts` and `StatsSummary.tsx`

**Files:**
- Create: `src/components/books/bookStats.ts`
- Test: `src/components/books/bookStats.test.ts`
- Create: `src/components/books/StatsSummary.tsx`

**Interfaces:**
- Consumes: `Book` from `../../types/book` (Task 3).
- Produces (consumed by Task 8): `computeBookStats(books: Book[], now?: Date): BookStats` (pure, tested) and `StatsSummary` component with props `{ books: Book[] }`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/books/bookStats.test.ts
import { describe, expect, it } from 'vitest'
import { computeBookStats } from './bookStats'
import type { Book } from '../../types/book'

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    hardcoverBookId: 1,
    title: 'Untitled',
    author: 'Some Author',
    rating: null,
    pageCount: null,
    dateRead: null,
    coverImageUrl: null,
    rereadCount: 0,
    isFavorite: false,
    ...overrides,
  }
}

describe('computeBookStats', () => {
  it('returns zeros and nulls for an empty library', () => {
    expect(computeBookStats([])).toEqual({
      totalRead: 0,
      readThisYear: 0,
      averageRating: null,
      mostReadAuthor: null,
    })
  })

  it('counts total read and read-this-year separately', () => {
    const now = new Date('2026-09-18')
    const books = [
      makeBook({ hardcoverBookId: 1, dateRead: '2026-01-01' }),
      makeBook({ hardcoverBookId: 2, dateRead: '2025-06-01' }),
      makeBook({ hardcoverBookId: 3, dateRead: null }),
    ]
    const stats = computeBookStats(books, now)
    expect(stats.totalRead).toBe(3)
    expect(stats.readThisYear).toBe(1)
  })

  it('averages ratings, ignoring books with no rating', () => {
    const books = [
      makeBook({ hardcoverBookId: 1, rating: 5 }),
      makeBook({ hardcoverBookId: 2, rating: 3 }),
      makeBook({ hardcoverBookId: 3, rating: null }),
    ]
    expect(computeBookStats(books).averageRating).toBe(4)
  })

  it('finds the most-read author when one has strictly more books', () => {
    const books = [
      makeBook({ hardcoverBookId: 1, author: 'Author A' }),
      makeBook({ hardcoverBookId: 2, author: 'Author B' }),
      makeBook({ hardcoverBookId: 3, author: 'Author A' }),
    ]
    expect(computeBookStats(books).mostReadAuthor).toBe('Author A')
  })

  it('breaks a tied count by first occurrence', () => {
    const books = [
      makeBook({ hardcoverBookId: 1, author: 'Author A' }),
      makeBook({ hardcoverBookId: 2, author: 'Author B' }),
    ]
    expect(computeBookStats(books).mostReadAuthor).toBe('Author A')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/components/books/bookStats.test.ts`
Expected: FAIL — module `./bookStats` not found.

- [ ] **Step 3: Implement `bookStats.ts`**

```ts
// src/components/books/bookStats.ts
import type { Book } from '../../types/book'

export type BookStats = {
  totalRead: number
  readThisYear: number
  averageRating: number | null
  mostReadAuthor: string | null
}

export function computeBookStats(books: Book[], now: Date = new Date()): BookStats {
  const currentYear = now.getFullYear()
  const totalRead = books.length
  const readThisYear = books.filter(
    (book) => book.dateRead != null && new Date(book.dateRead).getFullYear() === currentYear,
  ).length

  const ratedBooks = books.filter((book) => book.rating != null)
  const averageRating =
    ratedBooks.length === 0
      ? null
      : ratedBooks.reduce((sum, book) => sum + (book.rating ?? 0), 0) / ratedBooks.length

  const authorCounts = new Map<string, number>()
  for (const book of books) {
    if (!book.author) continue
    authorCounts.set(book.author, (authorCounts.get(book.author) ?? 0) + 1)
  }
  let mostReadAuthor: string | null = null
  let mostReadCount = 0
  for (const [author, count] of authorCounts) {
    if (count > mostReadCount) {
      mostReadAuthor = author
      mostReadCount = count
    }
  }

  return { totalRead, readThisYear, averageRating, mostReadAuthor }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/components/books/bookStats.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Implement `StatsSummary.tsx`**

```tsx
// src/components/books/StatsSummary.tsx
import type { Book } from '../../types/book'
import { computeBookStats } from './bookStats'
import { headingClass } from '../games/shared'

type Props = {
  books: Book[]
}

export function StatsSummary({ books }: Props) {
  const stats = computeBookStats(books)

  const tiles: { label: string; value: string }[] = [
    { label: 'Books Read', value: String(stats.totalRead) },
    { label: 'Read This Year', value: String(stats.readThisYear) },
    {
      label: 'Average Rating',
      value: stats.averageRating != null ? `${stats.averageRating.toFixed(1)}/5` : '—',
    },
    { label: 'Most-Read Author', value: stats.mostReadAuthor ?? '—' },
  ]

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Reading Stats</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-2xl border-2 border-[var(--cyber-purple)] bg-[var(--deep-space-purple)]/40 p-4 text-center shadow-glow-purple backdrop-blur-md"
          >
            <p className="text-2xl font-bold text-slate-100">{tile.value}</p>
            <p className="mt-1 text-xs tracking-wide text-slate-400 uppercase">{tile.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc -b tsconfig.app.json`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/components/books/bookStats.ts src/components/books/bookStats.test.ts src/components/books/StatsSummary.tsx
git commit -m "feat(books): add reading stats summary"
```

---

### Task 6: `src/components/books/FavoritesShowcase.tsx`

**Files:**
- Create: `src/components/books/FavoritesShowcase.tsx`

**Interfaces:**
- Consumes: `Book` from `../../types/book` (Task 3).
- Produces (consumed by Task 8): `FavoritesShowcase` component with props `{ books: Book[] }`.

No separate pure-function/test file — `books.filter((book) => book.isFavorite)` is a one-line filter with no branching worth extracting and testing on its own (unlike `computeBookStats`'s multi-field aggregation in Task 5).

- [ ] **Step 1: Implement the component**

```tsx
// src/components/books/FavoritesShowcase.tsx
import type { Book } from '../../types/book'
import { getResizedImageUrl } from '../../lib/image'
import { headingClass } from '../games/shared'

type Props = {
  books: Book[]
}

export function FavoritesShowcase({ books }: Props) {
  const favorites = books.filter((book) => book.isFavorite)

  if (favorites.length === 0) return null

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Favorites</h2>
      <p className="mt-2 text-slate-300">Books starred on Hardcover.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {favorites.map((book) => (
          <div
            key={book.hardcoverBookId}
            className="flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--neon-pink)] bg-[var(--deep-space-purple)]/40 shadow-glow-pink backdrop-blur-md"
          >
            {book.coverImageUrl && (
              <img
                src={getResizedImageUrl(book.coverImageUrl, 'medium')}
                alt={`Cover of ${book.title}`}
                loading="lazy"
                className="aspect-[2/3] w-full object-cover"
              />
            )}
            <div className="p-4">
              <p className="font-semibold text-slate-100">{book.title}</p>
              <p className="text-sm text-slate-400">{book.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b tsconfig.app.json`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/books/FavoritesShowcase.tsx
git commit -m "feat(books): add favorites showcase"
```

---

### Task 7: `src/components/books/bookFilters.ts` and `BookLibrary.tsx`

**Files:**
- Create: `src/components/books/bookFilters.ts`
- Test: `src/components/books/bookFilters.test.ts`
- Create: `src/components/books/BookLibrary.tsx`

**Interfaces:**
- Consumes: `Book` from `../../types/book` (Task 3); `BooksStatus` from `../../hooks/useBooks` (Task 3).
- Produces (consumed by Task 8): `searchBooks(books, query)`, `sortBooks(books, key)`, `BookSortKey` (pure, tested), and `BookLibrary` component with props `{ books: Book[]; status: BooksStatus }`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/books/bookFilters.test.ts
import { describe, expect, it } from 'vitest'
import { searchBooks, sortBooks } from './bookFilters'
import type { Book } from '../../types/book'

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    hardcoverBookId: 1,
    title: 'Untitled',
    author: 'Some Author',
    rating: null,
    pageCount: null,
    dateRead: null,
    coverImageUrl: null,
    rereadCount: 0,
    isFavorite: false,
    ...overrides,
  }
}

const dune = makeBook({ hardcoverBookId: 1, title: 'Dune', author: 'Frank Herbert', rating: 5, dateRead: '2026-01-01' })
const hobbit = makeBook({ hardcoverBookId: 2, title: 'The Hobbit', author: 'J.R.R. Tolkien', rating: 4, dateRead: '2026-05-01' })
const foundation = makeBook({ hardcoverBookId: 3, title: 'Foundation', author: 'Isaac Asimov', rating: null, dateRead: null })

describe('searchBooks', () => {
  it('returns everything for an empty query', () => {
    expect(searchBooks([dune, hobbit], '')).toEqual([dune, hobbit])
  })

  it('matches on title, case-insensitively', () => {
    expect(searchBooks([dune, hobbit], 'hobbit')).toEqual([hobbit])
  })

  it('matches on author', () => {
    expect(searchBooks([dune, hobbit], 'herbert')).toEqual([dune])
  })

  it('returns an empty array when nothing matches', () => {
    expect(searchBooks([dune, hobbit], 'nonexistent')).toEqual([])
  })
})

describe('sortBooks', () => {
  it('sorts by title ascending', () => {
    expect(sortBooks([hobbit, dune, foundation], 'title').map((b) => b.title)).toEqual([
      'Dune',
      'Foundation',
      'The Hobbit',
    ])
  })

  it('sorts by author ascending', () => {
    expect(sortBooks([dune, hobbit, foundation], 'author').map((b) => b.author)).toEqual([
      'Frank Herbert',
      'Isaac Asimov',
      'J.R.R. Tolkien',
    ])
  })

  it('sorts by rating descending, with unrated books last', () => {
    expect(sortBooks([foundation, hobbit, dune], 'rating').map((b) => b.title)).toEqual([
      'Dune',
      'The Hobbit',
      'Foundation',
    ])
  })

  it('sorts by dateRead descending (most recent first), with un-dated books last', () => {
    expect(sortBooks([dune, foundation, hobbit], 'dateRead').map((b) => b.title)).toEqual([
      'The Hobbit',
      'Dune',
      'Foundation',
    ])
  })

  it('does not mutate the input array', () => {
    const input = [hobbit, dune]
    sortBooks(input, 'title')
    expect(input).toEqual([hobbit, dune])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/components/books/bookFilters.test.ts`
Expected: FAIL — module `./bookFilters` not found.

- [ ] **Step 3: Implement `bookFilters.ts`**

```ts
// src/components/books/bookFilters.ts
import type { Book } from '../../types/book'

export type BookSortKey = 'title' | 'author' | 'rating' | 'dateRead'

export function searchBooks(books: Book[], query: string): Book[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return books
  return books.filter(
    (book) => book.title.toLowerCase().includes(normalized) || book.author.toLowerCase().includes(normalized),
  )
}

export function sortBooks(books: Book[], key: BookSortKey): Book[] {
  const sorted = [...books]
  switch (key) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'author':
      return sorted.sort((a, b) => a.author.localeCompare(b.author))
    case 'rating':
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
    case 'dateRead':
      return sorted.sort((a, b) => (b.dateRead ?? '').localeCompare(a.dateRead ?? ''))
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/components/books/bookFilters.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: Implement `BookLibrary.tsx`**

```tsx
// src/components/books/BookLibrary.tsx
import { useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Input } from '../../../@/components/ui/input'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../@/components/ui/table'
import type { Book } from '../../types/book'
import type { BooksStatus } from '../../hooks/useBooks'
import { searchBooks, sortBooks, type BookSortKey } from './bookFilters'
import { headingClass } from '../games/shared'

const SORT_OPTIONS: { key: BookSortKey; label: string }[] = [
  { key: 'dateRead', label: 'Date Read' },
  { key: 'title', label: 'Title' },
  { key: 'author', label: 'Author' },
  { key: 'rating', label: 'Rating' },
]

function formatDateRead(dateRead: string | null): string {
  if (!dateRead) return '—'
  return new Date(dateRead).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

type Props = {
  books: Book[]
  status: BooksStatus
}

export function BookLibrary({ books, status }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<BookSortKey>('dateRead')

  const rows = useMemo(() => sortBooks(searchBooks(books, search), sortKey), [books, search, sortKey])

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className={headingClass}>Library</h2>
      <p className="mt-2 text-slate-300">Everything read so far.</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSortKey(option.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                sortKey === option.key
                  ? 'border-[var(--laser-cyan)] text-[var(--laser-cyan)]'
                  : 'border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or author..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Date Read</TableHead>
              <TableHead>Re-reads</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'loading' ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400">
                  Loading your library...
                </TableCell>
              </TableRow>
            ) : status === 'error' ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400">
                  Unable to load your library right now. Please try again later.
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400">
                  No books match your search.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((book) => (
                <TableRow key={book.hardcoverBookId}>
                  <TableCell className="font-medium text-slate-100">{book.title}</TableCell>
                  <TableCell className="text-slate-300">{book.author}</TableCell>
                  <TableCell className="text-slate-300">{book.rating != null ? `${book.rating.toFixed(1)}/5` : '—'}</TableCell>
                  <TableCell className="text-slate-300">{formatDateRead(book.dateRead)}</TableCell>
                  <TableCell className="text-slate-300">{book.rereadCount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc -b tsconfig.app.json`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/components/books/bookFilters.ts src/components/books/bookFilters.test.ts src/components/books/BookLibrary.tsx
git commit -m "feat(books): add searchable/sortable book library table"
```

---

### Task 8: `Books.tsx`, `books.tsx` route, navbar entry — wire it all together

**Files:**
- Create: `src/components/Books.tsx`
- Create: `src/routes/books.tsx`
- Modify: `src/components/navbar.tsx` (add to `hobbyItems`)

**Interfaces:**
- Consumes: `useBooks` (Task 3), `CurrentlyReading` (Task 4), `StatsSummary` (Task 5), `FavoritesShowcase` (Task 6), `BookLibrary` (Task 7).
- Produces: the live `/books` route, reachable from the nav.

- [ ] **Step 1: Implement `src/components/Books.tsx`**

```tsx
// src/components/Books.tsx
import { useBooks } from '../hooks/useBooks'
import { CurrentlyReading } from './books/CurrentlyReading'
import { FavoritesShowcase } from './books/FavoritesShowcase'
import { StatsSummary } from './books/StatsSummary'
import { BookLibrary } from './books/BookLibrary'

export function Books() {
  const { books, status } = useBooks()

  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      <CurrentlyReading />
      <FavoritesShowcase books={books} />
      <StatsSummary books={books} />
      <BookLibrary books={books} status={status} />
    </div>
  )
}
```

- [ ] **Step 2: Implement `src/routes/books.tsx`**

```tsx
// src/routes/books.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Books } from '../components/Books'
import { seoMeta } from '../lib/meta'

export const Route = createFileRoute('/books')({
  head: () => ({
    meta: seoMeta({
      title: "Books I've Read",
      description: "Browse Aaron's reading library, synced live from Hardcover.",
      path: '/books',
    }),
  }),
  component: Books,
})
```

- [ ] **Step 3: Add the nav entry**

In `src/components/navbar.tsx`, edit `hobbyItems`:

```ts
const hobbyItems = [
  { to: '/games', label: 'Games' },
  { to: '/minerals_fossils', label: 'Minerals & Fossils' },
  { to: '/books', label: 'Books' },
]
```

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS — all prior tests plus the new ones from Tasks 1, 2, 5, 7 (23 new tests: 6 + 3 + 5 + 9)

- [ ] **Step 5: Typecheck everything**

Run: `npx tsc -b`
Expected: no errors (builds `tsconfig.app.json`, `tsconfig.node.json`, and `tsconfig.api.json` per the references in `tsconfig.json`)

- [ ] **Step 6: Manual/visual verification**

TanStack Router's file-based routing needs a dev-server restart to pick up the new `src/routes/books.tsx` file (it generates `src/routeTree.gen.ts` from the `routes` directory on start/change — if it's already running via `npm run dev`, stop and restart it). Plain `npm run dev` (Vite) does **not** serve `/api/*` — those are Vercel Functions, so use the Vercel CLI instead: `npx vercel dev`. It'll prompt to link the project on first run (link to the existing `wiserabidwombat/my-personal-site` Vercel project) and needs `HARDCOVER_API_TOKEN`/`HARDCOVER_USER_ID` in `.env.local` (added in Task 9) to actually return data.

- [ ] Run `npx vercel dev`, open `/books`
- [ ] Confirm the currently-reading strip shows real data (or its "Not reading anything right now" empty state if nothing's marked Currently Reading in Hardcover yet)
- [ ] Confirm the stats tiles show believable numbers
- [ ] Type into the library search box and confirm it filters
- [ ] Click through the four sort buttons and confirm the table re-orders
- [ ] Star a book in Hardcover, reload, confirm it now appears in Favorites (skip if there isn't time to go star one — at minimum confirm the Favorites section simply doesn't render when nothing's starred, per Step 1's `if (favorites.length === 0) return null`)
- [ ] Check the browser console for errors
- [ ] Click "Books" in the nav dropdown from another page and confirm it navigates correctly, including on mobile width (resize or use device toolbar)

- [ ] **Step 7: Commit**

```bash
git add src/components/Books.tsx src/routes/books.tsx src/components/navbar.tsx
git commit -m "feat(books): wire up the /books page and nav entry"
```

---

### Task 9: Env vars and README

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Consumes: nothing (documentation/config only).
- Produces: nothing further downstream — this is the plan's last task.

- [ ] **Step 1: Add the env vars to `.env.example`**

Append to `.env.example`:

```
# Hardcover (books page). Get a token at https://hardcover.app/account/api --
# it expires after 1 year and cannot be renewed programmatically, so you'll
# need to generate a new one and update it here/in Vercel when it does.
# HARDCOVER_USER_ID is your numeric Hardcover user id, not a secret -- get it
# by querying `{ me { id } }` against the API with your token.
HARDCOVER_API_TOKEN=
HARDCOVER_USER_ID=
```

- [ ] **Step 2: Add your real values to `.env.local`**

(Not committed — `.env.local` is gitignored.) Copy the two new lines from `.env.example` into your own `.env.local` and fill in the token from Step 1 of Task 1 and the user ID you looked up there.

- [ ] **Step 3: Update the README's environment variables table**

In `README.md`, add two rows to the existing variables table (after the `DATABASE_URL` row):

```markdown
| `HARDCOVER_API_TOKEN` | `api/books.ts`, `api/currently-reading.ts` | Hardcover Personal Access Token. Expires after 1 year with no programmatic renewal — regenerate manually at hardcover.app account settings when it does |
| `HARDCOVER_USER_ID` | `api/books.ts`, `api/currently-reading.ts` | Numeric Hardcover user ID (not a secret) — get it by querying `{ me { id } }` against the Hardcover API with your token |
```

- [ ] **Step 4: Add a "Books" paragraph to the README's "Data pipeline notes" section**

Add after the existing "Meta tag prerendering" paragraph:

```markdown
- **Books:** Unlike the board-games/fossils pipelines above, this one has no build step and no database at all. `api/books.ts` and `api/currently-reading.ts` query the Hardcover GraphQL API live on every request (edge-cached briefly via `Cache-Control`), so a newly-finished or newly-starred book on Hardcover shows up on the site without a redeploy or a manual sync step.
```

- [ ] **Step 5: Commit**

```bash
git add .env.example README.md
git commit -m "docs: document Hardcover env vars and books data pipeline"
```

---

## Plan Self-Review Notes

- **Spec coverage:** full library table (Task 7), favorites via `starred` (Task 6), stats summary (Task 5), live currently-reading (Tasks 2, 4), nav entry (Task 8), README updates (Task 9), both open items from the spec resolved by Task 1 Steps 1–2 (real API calls before writing the mapping code) — all covered.
- **No local storage / no scripts / no new dependencies:** confirmed — no `db/migrations`, no `scripts/`, no new `package.json` dependencies anywhere in this plan.
- **Type consistency:** `Book`/`CurrentlyReadingBook` field names and types are identical across `api/books.ts` (Task 1), `api/currently-reading.ts` (Task 2), and `src/types/book.ts` (Task 3) — checked hardcoverBookId/title/author/rating/pageCount/dateRead/coverImageUrl/rereadCount/isFavorite against each other line by line while writing this plan.
- **`BooksStatus`** is defined once, in `src/hooks/useBooks.ts` (Task 3), and imported (not redefined) by `BookLibrary.tsx` (Task 7).
