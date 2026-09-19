# Books Page Design

Date: 2026-09-18
Status: Approved for implementation planning

## Summary

Add a `/books` hobbies page tracking books read, backed entirely by
live queries to the Hardcover GraphQL API — no local database, no
import scripts, no manually-maintained fields. The page shows a full
searchable library, a favorites showcase (sourced from Hardcover's
native per-book `starred` flag), a stats summary, and a live
"currently reading" strip.

## Context

The site has two existing patterns for hobby-collection data:

- **Notion + build-time snapshot** (`games`): `scripts/fetch-games.mjs`
  pulls from Notion and writes `src/data/board-games.json`, which
  ships with the deployment; `api/games.ts` is a live serverless
  equivalent, and `useBoardGames` tries live first, falling back to
  the checked-in snapshot.
- **Neon Postgres + live serverless function** (`minerals_fossils`):
  `api/fossils.ts` queries the `fossils_and_minerals` table directly
  on every request (edge-cached via `Cache-Control`); no local
  snapshot.

An earlier version of this design targeted Goodreads, whose official
API closed to new developers in 2020, forcing an awkward
manual-CSV-import-plus-site-owned-fields architecture around it. The
user has an active Hardcover account and API key instead, which
changes the shape of the problem entirely. This section reflects
Hardcover's actual GraphQL schema — pulled directly from
[hardcoverapp/hardcover-docs](https://github.com/hardcoverapp/hardcover-docs)'s
`schema.graphql` and `field-descriptions.json` on GitHub, not just
secondhand docs/blog posts — resolving both open items the earlier
draft of this spec had flagged:

- Endpoint: `https://api.hardcover.app/v1/graphql`,
  `Authorization: Bearer <token>`. Free plan: 5,000 requests/day, 60/min,
  burst 10, 30s query timeout. No equivalent to the Goodreads RSS
  feed's 100-item cap. A single request may contain at most 5
  top-level queries.
- `user_books` is queryable via `where: { user_id: { _eq: ID },
  status_id: { _eq: N } }` (1 = Want to Read, 2 = Currently Reading, 3
  = Read, 4 = Paused, 5 = Did Not Finish, 6 = Ignored) — the confirmed
  fields actually used by this design: `rating`, `read_count`,
  `last_read_date`, `date_added`, `starred`, `status_id`, and the
  related `book { title, pages, image { url }, contributions { author
  { name } } } }`.
- **`user_books.read_count: Int!` already exists as a plain field.**
  Hardcover computes it for you — no need to fetch the nested
  `user_book_reads` array and count entries. Re-read count is simply
  `max(read_count - 1, 0)`.
- **`user_books.starred: Boolean!` already exists** ("User starred
  this book" per Hardcover's own field description) — a native
  per-book favorite flag, favored over a separately-queried named
  "Favorites" list: one field on the same query, nothing that breaks
  if a list gets renamed or restructured.
- The API is documented as "the exact same API used by the website,
  iOS and Android apps" and its only access restriction is that it
  must never be called from browser JS (token must stay server-side)
  — consistent with calling it from a Vercel serverless function, the
  same shape `api/fossils.ts` already uses for Postgres.
- **Operational note:** Personal Access Tokens expire after 1 year and
  cannot be renewed programmatically — must be manually regenerated in
  Hardcover account settings. Worth a comment in the README so this
  doesn't look like a mystery outage in a year.
- **Residual risk, not fully resolved:** Hardcover's roadmap lists "*2026
  Queries will have a maximum depth of 3*" as an upcoming (not yet
  shipped, per the docs' own Aug 2026 "Last Updated" stamp) limit. A
  query nesting `user_books → book → contributions → author → name` is
  4 levels of object nesting. A real-world example using this exact
  shape (a personal-site blog post from Jan 2026) works today. If the
  depth limit ships and breaks this, the fix is splitting into
  multiple top-level queries (still well under the 5-top-level-query
  cap) — noted as an implementation-time watch item, not a redesign.

Because none of this data is site-owned or needs to survive an
import, **the data pipeline follows the `games`/live-fetch shape, not
the `minerals_fossils`/Postgres shape** — nothing here needs local
persistence.

## Goals

- `/books`: full library (browsable/searchable/sortable table),
  favorites showcase, stats summary (total read, read this year,
  average rating, most-read author), and a live currently-reading
  strip.
- Favorites are sourced from Hardcover's native `starred` flag on each
  book — no site-side favorite storage, no separate list to maintain.
- Re-read count is read directly from Hardcover's `read_count` field,
  not tracked separately.
- Library and currently-reading data reflect Hardcover directly on
  each page load (subject to edge caching) — no manual sync step, no
  script to remember to run.
- `Books` added to the `hobbyItems` nav dropdown.
- README documents the new env var, the (lack of a) data pipeline
  step, and the yearly token-expiration gotcha.

## Non-goals (v1)

- No local database, no scripts, no manual import/export step of any
  kind — this was the central complexity of the Goodreads-based
  version and Hardcover's live API removes the need for it entirely.
- No write-back to Hardcover (read-only integration; starring/rating
  books happens in the Hardcover app, not on the site).
- No review-text rendering beyond what Hardcover returns as plain
  text — no rich text/markdown handling in v1.

## Approach: data access

Two approaches were considered:

- **(A, chosen) Live serverless GraphQL query**, mirroring
  `api/fossils.ts`'s live-query shape (a Postgres query there, a
  Hardcover GraphQL query here) rather than a build-time snapshot.
  Since nothing is site-owned and there's no external data source with
  meaningful downtime risk to hedge against with a fallback snapshot,
  this is the simplest option that satisfies "reflects Hardcover
  without a manual step." It's also consistent with how Hardcover's
  own apps use this same API — live, per-request.
- **(B, rejected) Build-time snapshot**, mirroring the `games`/Notion
  pattern (`scripts/fetch-games.mjs` → `src/data/board-games.json`).
  Rejected because that pattern exists specifically to avoid shipping
  a secret token to the client and to avoid a request round-trip on
  every page load for data that only changes when someone edits
  Notion by hand. Neither reason applies as strongly here, and a
  snapshot would reintroduce exactly the "requires a manual step to
  stay current" problem this redesign is meant to eliminate — the
  user is actively adding books to Hardcover over the coming weeks,
  and the whole point of switching off Goodreads was to stop requiring
  a manual sync action to see new books on the site.

## Hardcover integration

Two serverless functions, both server-side only (the API token never
reaches client code):

**`api/books.ts`** — queries `user_books` where `status_id: 3` (read),
selecting: `book_id`, `rating`, `read_count`, `last_read_date`,
`starred`, and `book { title, pages, image { url }, contributions {
author { name } } }`. `Cache-Control: s-maxage=60,
stale-while-revalidate=300`, matching `api/fossils.ts`.

**`api/currently-reading.ts`** — same endpoint/auth, `user_books`
where `status_id: 2`, selecting `book_id` and `book { title, image {
url }, contributions { author { name } } }`. `Cache-Control:
s-maxage=300, stale-while-revalidate=900` (currently-reading changes
less often than once every few minutes in practice, so a slightly
longer cache window than the full-library endpoint is reasonable).
Returns `{ books: [] }` rather than an error if nothing is in progress
or the request fails, so the section can render an empty state.

Both handlers guard on `HARDCOVER_API_TOKEN` being present (matching
`api/fossils.ts`'s `DATABASE_URL` guard) and return a 500 with a clear
message if it's missing.

`src/types/book.ts`:

```ts
export type Book = {
  hardcoverBookId: number // user_books.book_id
  title: string // book.title
  author: string // book.contributions[].author.name, joined with ", "
  rating: number | null // user_books.rating
  pageCount: number | null // book.pages
  dateRead: string | null // user_books.last_read_date
  coverImageUrl: string | null // book.image.url
  rereadCount: number // max(user_books.read_count - 1, 0)
  isFavorite: boolean // user_books.starred
}

export type CurrentlyReadingBook = {
  hardcoverBookId: number
  title: string
  author: string
  coverImageUrl: string | null
}
```

## Routing

- `src/routes/books.tsx` → `/books`, `seoMeta` title "Books I've
  Read", following the `games.tsx`/`minerals_fossils.tsx` pattern
  exactly.
- `hobbyItems` in `src/components/navbar.tsx` gains
  `{ to: '/books', label: 'Books' }`.

## Components

`src/components/Books.tsx` orchestrates, mirroring `Games.tsx`'s
composition-root shape:

- **`CurrentlyReading.tsx`** — fetches `/api/currently-reading`
  directly (separate endpoint/cache lifetime from the main library);
  renders an empty state when nothing is in progress.
- **`FavoritesShowcase.tsx`** — props `{ books: Book[] }`, filters to
  `isFavorite`, same card-grid idiom as `FavoritesList`
  (`src/components/games/FavoritesList.tsx`).
- **`StatsSummary.tsx`** — props `{ books: Book[] }`, computes total
  read, read-this-year (from `dateRead` year), average `rating`, and
  most-frequent `author`, client-side from already-fetched data.
- **`BookLibrary.tsx`** — full table with search (title/author) and
  sort (title/author/rating/date read), same pattern as
  `GameInventory.tsx`.

`src/hooks/useBooks.ts` — fetches `/api/books`, exposing `{ books,
status }` (`'loading' | 'live' | 'error'`); no static fallback
snapshot, consistent with `api/fossils.ts` having none either.

## Styling

Reuses the established `synthwave-ui` idiom already used across
`games`/`minerals_fossils` — `Card` + `ring-[var(--color)]/50
shadow-glow-*`, no new colors or effects introduced.

## Dependencies to add

None. GraphQL requests are plain JSON over `fetch`; no CSV or XML
parsing is needed with this data source.

## Testing

- Unit tests for the Hardcover-response-to-`Book`/`CurrentlyReadingBook`
  mapping in `api/books.ts`/`api/currently-reading.ts`, including: the
  reread-count computation (`read_count` of 0, 1, and 3+), the
  multi-contributor author-name join, missing cover image, and the
  empty/error-fallback cases.
- Manual/visual verification per this repo's established practice: run
  the dev server with a real `HARDCOVER_API_TOKEN`, screenshot
  `/books`, verify search/sort on the library table, verify favorites
  filtering matches books starred in Hardcover, verify stats numbers
  against known data, verify currently-reading renders (and its empty
  state when nothing is in progress).

## README updates

Add `HARDCOVER_API_TOKEN` to the environment variables table
(server-side secret, also required in the Vercel dashboard, same as
the existing Notion/Neon vars), with a one-line note that it expires
yearly and must be regenerated manually in Hardcover account settings
(no programmatic renewal exists). Add a short "Books" paragraph to the
existing "Data pipeline notes" section explaining that — unlike the
board-games/fossils pipelines — this one has no build step or database
at all: both endpoints query Hardcover live on each request.

## Open items for implementation

- Watch for Hardcover's "max query depth 3" roadmap item shipping —
  see the Context section above for the exact query shape at risk and
  the fallback (split into multiple top-level queries) if it breaks.
- Confirm `book.contributions[].author.name` is the correct path for
  multi-author books (vs. a single top-level author field) against a
  real authenticated request early in implementation, before writing
  the response-mapping tests against assumed field names.
