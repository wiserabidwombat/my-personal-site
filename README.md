# my-personal-site

Aaron Tilley's personal site — about/resume, a blog, a board game collection backed by Notion, and a minerals & fossils catalog backed by Postgres. Built as a client-side React SPA with prerendered meta tags for link previews, deployed on Vercel.

Live at [aarontilley.me](https://aarontilley.me).

## Tech stack

- **Framework:** React 19 + [TanStack Router](https://tanstack.com/router) (file-based routes in `src/routes`), built with Vite
- **Styling:** Tailwind CSS v4, [shadcn](https://ui.shadcn.com/)-based components
- **Data:**
  - Board games sourced from a Notion database (`api/games.ts`, `scripts/fetch-games.mjs`)
  - Minerals & fossils catalog in Neon Postgres (`api/fossils.ts`, `db/migrations`)
  - Blog posts as markdown files in `content/blog`
- **Hosting:** Vercel (serverless functions in `api/`, static SPA otherwise)
- **Testing:** Vitest

## Prerequisites

- Node.js `v20.19.0` (see `.nvmrc`) — `nvm use` if you have nvm installed
- npm (bundled with Node)

## Getting started

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with real values — see [Environment variables](#environment-variables) below. Then:

```bash
npm run dev
```

This starts the Vite dev server (default `http://localhost:5173`).

## Environment variables

Copy `.env.example` to `.env.local` (already gitignored) and fill in:

| Variable | Used by | Notes |
| --- | --- | --- |
| `NOTION_TOKEN` | `scripts/fetch-games.mjs`, `api/games.ts` | Notion integration token for the board games database |
| `NOTION_DATABASE_ID` | `scripts/fetch-games.mjs`, `api/games.ts` | ID of the Notion database holding the board game collection |
| `NOTION_DATA_SOURCE_ID` | `api/games.ts` | Notion data source ID |
| `DATABASE_URL` | `scripts/migrate.mjs`, `api/fossils.ts` | Neon Postgres connection string. In production this is auto-injected by the Vercel Marketplace Neon integration |
| `HARDCOVER_API_TOKEN` | `api/books.ts`, `api/currently-reading.ts` | Hardcover Personal Access Token. Expires after 1 year with no programmatic renewal — regenerate manually at hardcover.app account settings when it does |
| `HARDCOVER_USER_ID` | `api/books.ts`, `api/currently-reading.ts` | Numeric Hardcover user ID (not a secret) — get it by querying `{ me { id } }` against the Hardcover API with your token |

These same variables must also be set in the Vercel dashboard for the deployed `api/*.ts` functions to work. Never commit real values — `.env.local` is gitignored.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Run tests, typecheck, generate the RSS feed, build the production bundle, then prerender per-route meta tags |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest test suite once |
| `npm run fetch:games` | Pull the board game collection from Notion into `src/data/board-games.json` (build-time snapshot; requires `NOTION_TOKEN`/`NOTION_DATABASE_ID`) |
| `npm run db:migrate` | Apply every `.sql` file in `db/migrations`, in filename order, against `DATABASE_URL` |

## Project structure

```
api/            Vercel serverless functions (games, fossils/minerals)
content/blog/   Blog posts as markdown
db/migrations/  SQL migrations for the fossils/minerals Postgres table
public/         Static assets, generated rss.xml
scripts/        Build-time Node scripts (Notion fetch, DB migrate, RSS, meta prerender)
src/
  components/   UI components (incl. blog/, fossils/, games/ subfolders)
  data/         Generated data snapshots (e.g. board-games.json)
  hooks/        React hooks
  lib/          Shared logic (blog parsing, meta tags, resume PDF generation, etc.)
  routes/       TanStack Router file-based routes
  types/        Shared TypeScript types
```

## Data pipeline notes

- **Board games:** `scripts/fetch-games.mjs` is a build-time-only script that reads from Notion and writes a static JSON snapshot to `src/data/board-games.json`; the Notion token never reaches client code. `api/games.ts` is the live serverless equivalent used at request time.
- **Minerals & fossils:** Stored in Neon Postgres. Run `npm run db:migrate` after adding a new file to `db/migrations` to apply it.
- **RSS feed:** `scripts/generate-rss.mjs` builds `public/rss.xml` from the same markdown-parsing logic the site itself uses, so the feed can't drift from what's rendered on the blog.
- **Meta tag prerendering:** Since this is a pure client-side SPA, `scripts/prerender-meta.mjs` runs after `vite build` to write a real `dist/<route>/index.html` per page with the correct OpenGraph/Twitter tags baked in, so link-preview crawlers (which don't execute JS) see the right metadata. `vercel.json` rewrites everything else to `index.html` for client-side routing.
- **Books:** Unlike the board-games/fossils pipelines above, this one has no build step and no database at all. `api/books.ts` and `api/currently-reading.ts` query the Hardcover GraphQL API live on every request (edge-cached briefly via `Cache-Control`), so a newly-finished or newly-starred book on Hardcover shows up on the site without a redeploy or a manual sync step.

## Testing

```bash
npm test
```

Vitest runs in a Node environment (see `vitest.config.ts`). Tests currently cover blog parsing (`src/lib/blog.test.ts`) and image handling (`src/lib/image.test.ts`).

## Deployment

The site deploys to Vercel. `npm run build` is the build command Vercel runs; it produces a static `dist/` output plus the prerendered per-route HTML, and `api/*.ts` files deploy as serverless functions. Ensure the environment variables above are set in the Vercel project settings before deploying.
