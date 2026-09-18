# Books Page Design

Date: 2026-09-18
Status: Approved for implementation planning

## Summary

Add a `/books` hobbies page tracking books read, backed entirely by
live queries to the Hardcover GraphQL API — no local database, no
import scripts, no manually-maintained fields. The page shows a full
searchable library, a favorites showcase (sourced from a Hardcover
list), a stats summary, and a live "currently reading" strip.

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
changes the shape of the problem entirely:

- Hardcover's GraphQL API (`https://api.hardcover.app/v1/graphql`,
  `Authorization: Bearer <token>`) is actively maintained, requires no
  CSV export, and has no equivalent to the Goodreads RSS feed's
  100-item cap. Rate limit is 60 requests/min, 30s timeout, max query
  depth 3.
- `user_books` can be queried by `status_id` (2 = currently reading, 3
  = read) directly — the full library, live, in one query.
- Rereads are tracked natively: each reread opens a new entry in
  `user_book_reads`, so a re-read count is derivable from the API
  response rather than being a field the site owns and maintains.
- Hardcover has a native "Lists" feature, so a "Favorites" list
  maintained on Hardcover itself is a cleaner source of truth than a
  site-side flag.

Because of this, **the data pipeline follows the `games`/live-fetch
shape, not the `minerals_fossils`/Postgres shape** — there is nothing
here that needs local persistence, since nothing is site-owned.

## Goals

- `/books`: full library (browsable/searchable/sortable table),
  favorites showcase, stats summary (total read, read this year,
  average rating, most-read author), and a live currently-reading
  strip.
- Favorites are sourced from a "Favorites" list the user maintains
  directly in their Hardcover account — no site-side favorite storage.
- Re-read count is computed from Hardcover's own read-session data,
  not tracked separately.
- Library and currently-reading data reflect Hardcover directly on
  each page load (subject to edge caching) — no manual sync step, no
  script to remember to run.
- `Books` added to the `hobbyItems` nav dropdown.
- README documents the new env var and the (lack of a) data pipeline
  step.

## Non-goals (v1)

- No local database, no scripts, no manual import/export step of any
  kind — this was the central complexity of the Goodreads-based
  version and Hardcover's live API removes the need for it entirely.
- No write-back to Hardcover (read-only integration; favoriting/rating
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
  without a manual step."
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
requesting per book: title, contributor/author name(s), user rating,
page count, dates read, cover image URL, and the nested
`user_book_reads` list (for computing reread count). In the same
request, queries the user's "Favorites" list for its member book IDs,
and marks `isFavorite` on each returned book by membership.
`Cache-Control: s-maxage=60, stale-while-revalidate=300`, matching
`api/fossils.ts`.

**`api/currently-reading.ts`** — same endpoint/auth, `user_books`
where `status_id: 2`. `Cache-Control: s-maxage=300,
stale-while-revalidate=900` (currently-reading changes less often than
once every few minutes in practice, so a slightly longer cache window
than the full-library endpoint is reasonable). Returns `{ books: [] }`
rather than an error if the shelf is empty or the request fails, so
the section can render an empty state.

Both handlers guard on `HARDCOVER_API_TOKEN` being present (matching
`api/fossils.ts`'s `DATABASE_URL` guard) and return a 500 with a clear
message if it's missing.

`src/types/book.ts`:

```ts
export type Book = {
  hardcoverBookId: string
  title: string
  author: string
  rating: number | null
  pageCount: number | null
  dateRead: string | null
  coverImageUrl: string | null
  rereadCount: number // max(user_book_reads.length - 1, 0)
  isFavorite: boolean
}

export type CurrentlyReadingBook = {
  hardcoverBookId: string
  title: string
  author: string
  coverImageUrl: string | null
}
```

**Open item (see below):** exact Hardcover field/type names (e.g. how
contributors/authors are nested under `book`, the exact shape of the
Favorites list query) need to be verified against a real authenticated
query during implementation — the shapes above are based on published
docs and third-party write-ups, not a live response inspected
firsthand.

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
  reread-count computation (0, 1, and multiple `user_book_reads`
  entries), favorite-membership matching, and the empty/error-fallback
  cases.
- Manual/visual verification per this repo's established practice: run
  the dev server with a real `HARDCOVER_API_TOKEN`, screenshot
  `/books`, verify search/sort on the library table, verify favorites
  filtering matches the Hardcover Favorites list, verify stats numbers
  against known data, verify currently-reading renders (and its empty
  state when nothing is in progress).

## README updates

Add `HARDCOVER_API_TOKEN` to the environment variables table
(server-side secret, also required in the Vercel dashboard, same as
the existing Notion/Neon vars). Add a short "Books" paragraph to the
existing "Data pipeline notes" section explaining that — unlike the
board-games/fossils pipelines — this one has no build step or database
at all: both endpoints query Hardcover live on each request.

## Open items for implementation

- Verify Hardcover's exact GraphQL field names, nesting, and the
  practical meaning of "max query depth 3" against a real query using
  the user's API key — the query shapes in this spec are based on
  published docs and third-party integration write-ups, not a
  firsthand response.
- Verify the exact query/mutation shape for reading a user's named
  list ("Favorites") and its member books — confirm list membership
  can be fetched in the same request as `user_books`, or whether it
  needs a second query.
