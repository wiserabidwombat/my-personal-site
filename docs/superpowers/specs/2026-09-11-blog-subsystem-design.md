# Blog Subsystem Design

Date: 2026-09-11
Status: Approved for implementation planning

## Summary

Add a markdown-driven blog to the personal site: a `/blog` listing page
(responsive card grid with tag filtering) and a `/blog/$slug` article
page, styled per the `synthwave-ui` skill. Content lives as markdown
files with YAML frontmatter in `content/blog/`, loaded entirely at
build time — no new server code, no build script, no API route.

## Context

The site is a Vite + React 19 SPA using TanStack Router's file-based
routing (`src/routes/*`), Tailwind CSS 4, and shadcn/ui components,
already themed with a custom synthwave design system (`--neon-pink`,
`--laser-cyan`, `--cyber-purple`, `--glow-*`, `bg-synth-grid` utility
in `src/index.css`). External data (Notion game inventory, Neon
mineral/fossil catalog) is fetched via Vercel serverless functions
(`api/*.ts`) and client hooks (`src/hooks/use*.ts`) — but blog content
is static and ships with the deployment, so that pattern doesn't apply
here (see Approach A below).

There is currently no dynamic route segment anywhere in the app and no
markdown-rendering pipeline. `gray-matter` and `react-markdown` are not
yet installed.

## Goals

- `/blog`: responsive grid of post cards (3 cols desktop / 2 tablet / 1
  mobile), each showing image, title, truncated blurb, date, optional
  author, and tag badges. Clicking anywhere on a card navigates to the
  post.
- Tag badges are clickable and filter the grid client-side; an "All"
  option resets the filter.
- `/blog/$slug`: full article view — hero image, title, meta, tag
  badges, rendered markdown body, and a "← Back to blog" button.
- `Blog` added to the primary nav.
- Accessible (semantic HTML, alt text, heading hierarchy) and
  reasonably lazy (card/list images use `loading="lazy"`).

## Non-goals (v1)

- Pagination — deferred; revisit if post count grows large enough to
  matter.
- Search — deferred.
- MDX / embedded interactive components in post bodies — plain
  markdown via `react-markdown` is sufficient; nothing in this design
  requires JSX inside content.
- A CMS or authoring UI — posts are authored as markdown files directly
  in the repo, same mental model as editing code.

## Approach: how posts are loaded

Three approaches were considered for `getAllPosts()`/`getPostBySlug()`:

- **(A, chosen) Vite `import.meta.glob` + client-side `gray-matter`
  parsing.** `import.meta.glob('/content/blog/*.md', { query: '?raw',
  eager: true })` pulls every post's raw markdown text into the client
  bundle at build time. `gray-matter` (pure JS, browser-safe) splits
  frontmatter from body per file. No server round-trip, no extra build
  step, no new deployment config.
- **(B, rejected) Prebuild script → JSON index**, mirroring
  `scripts/fetch-games.mjs` → `src/data/board-games.json`. Rejected
  because that pattern exists in this repo specifically because
  Notion/Neon are *external* data sources requiring a fetch step; local
  markdown files are already build-time-known and don't need that
  indirection. Adds an extra step a future editor must remember to run.
- **(C, rejected) Vercel serverless function reads `content/blog` at
  request time**, mirroring `api/fossils.ts`/`api/games.ts`. Rejected:
  pays a network round-trip + cold start to read files that already
  ship in the same deployment, and requires explicit `includeFiles`
  bundling config for a non-code directory.

**Trade-off accepted with (A):** all post bodies ship inside the
client JS bundle (specifically the `/blog`-route chunk, since
TanStack Router's `autoCodeSplitting` already code-splits per route).
Acceptable at personal-blog scale (tens of posts); would need
revisiting only if this became a large publication.

## Data model

```
content/blog/*.md          — one file per post (filename is not load-bearing; slug comes from frontmatter)
public/blog/*.{jpg,png,webp} — featured images, referenced from frontmatter as "/blog/foo.jpg"
```

Frontmatter fields:

| field    | type       | required | notes                                      |
|----------|------------|----------|---------------------------------------------|
| title    | string     | yes      |                                              |
| slug     | string     | yes      | must be unique; used for `/blog/$slug`      |
| image    | string     | yes      | path under `public/blog/` or full URL       |
| blurb    | string     | yes      | 2–3 sentence summary, shown truncated on card |
| date     | string     | yes      | ISO date (`YYYY-MM-DD`); posts sort newest-first |
| author   | string     | no       |                                              |
| tags     | string[]   | no       | YAML list; omitted or empty = untagged      |

`src/types/blog-post.ts`:

```ts
export type BlogPost = {
  title: string
  slug: string
  image: string
  blurb: string
  date: string
  author?: string
  tags?: string[]
  body: string // raw markdown, rendered by react-markdown at the article route
}
```

`src/lib/blog.ts` exposes:

- `getAllPosts(): BlogPost[]` — parses every file via
  `import.meta.glob`, sorts by `date` descending.
- `getPostBySlug(slug: string): BlogPost | undefined`.
- `getAllTags(): string[]` — deduped, sorted tag list across all posts,
  used to build the tag filter UI.

**Malformed frontmatter fails at build time.** `getAllPosts()` asserts
required fields are present (title/slug/image/blurb/date) and throws
if not, and asserts slugs are unique. Content is build-time-known and
authored by the same person editing code, so this is the same contract
as a TypeScript compile error — better to fail the build than ship a
broken card silently.

## Routing

- `src/routes/blog.tsx` → `/blog` — listing page.
- `src/routes/blog.$slug.tsx` → `/blog/$slug` — article page.
  `getPostBySlug` returning `undefined` renders an in-page "Post not
  found" state with a link back to `/blog` (no new global 404 route;
  consistent with how the rest of the site has no catch-all route
  today).
- `Navbar` gets a new top-level `{ to: '/blog', label: 'Blog' }` entry
  in `primaryNavItems` (`src/components/navbar.tsx`).

## Components

New directory `src/components/blog/`:

- **`BlogCard.tsx`** — props: `{ post: BlogPost }`. Renders a shadcn
  `Card` wrapped entirely in a TanStack `Link` (`to="/blog/$slug"
  params={{ slug: post.slug }}`) — the whole card is the click target,
  not a nested "read more" link. Image is 16:9 `object-cover`, blurb
  uses `line-clamp-3`, meta row shows formatted date (+ author if
  present), tags render as small `Badge`s. Hover: border glow
  intensifies, `hover:-translate-y-1`, image gets a subtle
  `hover:brightness-110`.
- **`BlogGrid.tsx`** — props: `{ posts: BlogPost[] }`. Renders the
  responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), one
  `BlogCard` per post, plus an empty state ("No posts match this tag
  yet.") when filtering yields zero results.
- **`TagFilter.tsx`** — props: `{ tags: string[]; active: string |
  null; onChange: (tag: string | null) => void }`. A row of clickable
  `Badge`s (or shadcn `Tabs`) including an "All" option. Presentational
  only — filtering state is owned by the `/blog` route component, not
  the router (no `?tag=` query param in v1, keeping this a plain
  `useState` — YAGNI; can be promoted to a search param later if deep
  linking to a filtered view becomes a real need).
- **`BlogPostView.tsx`** — the article route's component: hero image
  (`bg-synth-grid` section, not lazy-loaded since it's above the
  fold), `h1` title, meta row, tag badges, `<ReactMarkdown>` body, and
  a "← Back to blog" shadcn `Button` (ghost/outline variant, styled
  per synthwave-ui, linking to `/blog`).

## Styling (synthwave-ui)

Reuses the exact idiom already established in `NeonShowcase.tsx` and
`stack.tsx`: `Card` + `ring-[var(--color)]/50 shadow-glow-*`, cycling
pink/cyan/purple across cards for rhythm (same `glowStyles` map
pattern as `stack.tsx`). Both `/blog` and `/blog/$slug` open with a
`bg-synth-grid` hero section matching every other page. No new colors,
gradients, or effects are introduced — this design intentionally reuses
the established token set rather than inventing a blog-specific look.

## Accessibility & performance

- Semantic `<article>` for the post body, `<time dateTime={post.date}>`
  for the date.
- `alt` text: frontmatter could optionally gain an `imageAlt` field,
  but v1 falls back to `post.title` for image alt text to avoid
  over-specifying frontmatter for a first pass — sufficient for a
  personal blog's featured images.
- Heading hierarchy: page `h1` is the post title; markdown body
  headings start at `h2` (enforced by convention in authored content,
  not programmatically rewritten — `react-markdown` renders whatever
  heading level the markdown uses, so post authors are expected to
  start body headings at `##`).
- `loading="lazy"` on all `BlogCard` images and on any images inside
  markdown bodies; the article hero image is excluded (above the
  fold).

## Dependencies to add

- `gray-matter` — frontmatter parsing.
- `react-markdown` — markdown body rendering.

## Testing

- Unit-style checks for `src/lib/blog.ts`: sorting order (newest
  first), `getPostBySlug` miss returns `undefined`, missing
  required-field frontmatter throws, duplicate slugs throw.
- Manual/visual verification (per this repo's established practice):
  run the dev server, screenshot `/blog` and a `/blog/$slug` article,
  verify tag filtering changes the grid, verify card click navigates,
  verify "Post not found" state for a bogus slug, check console for
  errors.

## Open items for implementation

- Exact sample posts (title/content) for the two seed posts are left
  to implementation — should demonstrate: a post with tags + author,
  and a post without either, to prove the optional fields truly are
  optional.
