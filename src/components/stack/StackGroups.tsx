import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  Atom01Icon,
  PaintBoardIcon,
  ComponentIcon,
  Route01Icon,
  TriangleIcon,
  Notion01Icon,
  DatabaseLightningIcon,
  Book01Icon,
  MusicNote01Icon,
  ChessIcon,
  Image01Icon,
  ImageCropIcon,
  TestTubeIcon,
  Pdf02Icon,
  AiBrain02Icon,
} from '@hugeicons/core-free-icons'
import { gameCardBaseClass } from '../games/shared'

type Tech = { name: string; role: string; icon: IconSvgElement }
type Group = { title: string; items: Tech[] }

// Every description is checked against the code it describes (api/,
// scripts/, package.json, vercel.json) -- keep it that way when editing.
const groups: Group[] = [
  {
    title: 'Frontend',
    items: [
      {
        name: 'React',
        role: 'The UI library behind every component on the site, from the navbar to a single badge.',
        icon: Atom01Icon,
      },
      {
        name: 'TanStack Router',
        role: 'Type-safe, file-based routing: each route file in src/routes becomes a page, and the router plugin generates the route tree and splits each page into its own bundle.',
        icon: Route01Icon,
      },
      {
        name: 'Tailwind CSS',
        role: 'Styles every page. The synthwave palette, glow shadows, and grid backgrounds are custom theme tokens and utilities in index.css.',
        icon: PaintBoardIcon,
      },
      {
        name: 'shadcn/ui',
        role: 'Accessible primitives built on Base UI (Dialog, Popover, Navigation Menu) plus Card, Badge, and Input, copied into src/components/ui and themed to the palette.',
        icon: ComponentIcon,
      },
    ],
  },
  {
    title: 'Data Sources',
    items: [
      {
        name: 'Notion',
        role: 'The board game collection. The Games page calls api/games.ts, which reads Notion live behind a 5-minute edge cache; if that call fails, the page falls back to a snapshot checked into the repo.',
        icon: Notion01Icon,
      },
      {
        name: 'Neon',
        role: 'Serverless Postgres holding the minerals & fossils catalog, queried by api/fossils.ts. Schema changes are versioned in db/migrations.',
        icon: DatabaseLightningIcon,
      },
      {
        name: 'Hardcover',
        role: "The reading library behind the Books page, from Hardcover's GraphQL API via api/books.ts and api/currently-reading.ts. Fetched live behind a short edge cache, with no database of its own.",
        icon: Book01Icon,
      },
      {
        name: 'Spotify',
        role: 'My listening data on the Music page, from the Spotify Web API. api/spotify.ts caches its access token in memory until shortly before it expires, fetches each section in parallel, and serves the result behind a short edge cache.',
        icon: MusicNote01Icon,
      },
      {
        name: 'BoardGameGeek',
        role: "Box art, ratings, and other game details. A local script (npm run sync:bgg) copies them into Notion, so the site never calls BoardGameGeek's API; box art loads straight from BoardGameGeek's image CDN.",
        icon: ChessIcon,
      },
    ],
  },
  {
    title: 'Infrastructure & Tooling',
    items: [
      {
        name: 'Vercel',
        role: 'Hosts the site and builds every push. The api/ folder runs as serverless functions for games, fossils, books, currently reading, and Spotify.',
        icon: TriangleIcon,
      },
      {
        name: 'Vercel Blob',
        role: "Stores the full-size minerals & fossils photos. Each specimen's row in Neon holds its photo's Blob URL.",
        icon: Image01Icon,
      },
      {
        name: 'wsrv.nl',
        role: 'An image resizing proxy that makes the thumbnail and medium versions of the fossil photos on request, so Blob only stores one original per photo.',
        icon: ImageCropIcon,
      },
      {
        name: 'Vitest',
        role: 'Runs the test suite as the first step of every build, so a failing test stops the deploy.',
        icon: TestTubeIcon,
      },
      {
        name: 'jsPDF',
        role: 'Generates the downloadable resume PDF in the browser from resume-data.ts, the same data the Resume page renders.',
        icon: Pdf02Icon,
      },
      {
        name: 'Claude Code',
        role: 'How most of the site is built, with an orchestrator agent and a custom design skill. See How I Build With AI below.',
        icon: AiBrain02Icon,
      },
    ],
  },
]

export function StackGroups() {
  return (
    <div className="mt-6 space-y-8">
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase">{group.title}</h3>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((tech) => (
              <li key={tech.name} className={`${gameCardBaseClass} flex-col p-5`}>
                <HugeiconsIcon
                  icon={tech.icon}
                  strokeWidth={2}
                  className="size-6 text-[var(--laser-cyan)]"
                  aria-hidden="true"
                />
                <p className="mt-3 font-semibold text-slate-50">{tech.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">{tech.role}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
