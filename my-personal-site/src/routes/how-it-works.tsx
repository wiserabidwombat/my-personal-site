import { createFileRoute } from '@tanstack/react-router'
import { MermaidDiagram } from '../components/MermaidDiagram'
import { seoMeta } from '../lib/meta'

export const Route = createFileRoute('/how-it-works')({
  head: () => ({
    meta: seoMeta({
      title: 'How It Works',
      description: 'A look under the hood at how this site is built, hosted, and kept in sync with its data.',
      path: '/how-it-works',
    }),
  }),
  component: HowItWorksRouteComponent,
})

// Node/edge colors intentionally stay hardcoded hex (not the --neon-pink/
// --laser-cyan CSS custom properties) rather than swap for the light theme:
// the diagram is meant to read like a permanently-dark architecture panel,
// so its container also stays a fixed dark surface regardless of the
// site-wide theme toggle.
const architectureDiagram = `
flowchart TB
    subgraph SitePages["🖥️ Site Pages (React + Tailwind + shadcn/ui)"]
        Games["Game Inventory<br/>+ Favorites + Random Picker"]
        Minerals["Minerals &amp; Fossils<br/>+ Showcase + Catalog Ledger"]
        Blog["Blog<br/>Listing + Post Pages"]
        Static["About / Resume / Contact"]
    end

    subgraph VercelPlatform["▲ Vercel Platform"]
        Hosting["Vercel Hosting<br/>(Build + Deploy)"]
    end

    subgraph DataSources["📦 Data Sources"]
        Notion["Notion<br/>Board Game Collection (Database)"]
        Neon["Neon Postgres<br/>Fossils &amp; Minerals Table"]
        Markdown["Markdown Files<br/>Blog Posts (frontmatter: title, tags, date)"]
    end

    subgraph External["🌐 External Services"]
        Blob["Vercel Blob<br/>(Public Image Storage)"]
        Wsrv["wsrv.nl<br/>(Image Resizing Proxy)"]
    end

    Hosting -.->|Build + Deploy| SitePages
    Notion -->|Live API Sync| Games
    Neon -->|Query| Minerals
    Markdown -->|Parsed at Build/Runtime| Blog
    Neon -->|Original Image URL| Blob
    Blob --> Wsrv
    Wsrv -->|Resized: Thumbnail/Medium/Large| Minerals

    classDef pageNode fill:#1a0f2e,stroke:#ff2fd0,color:#ffffff,stroke-width:2px
    classDef dataNode fill:#0d1b2a,stroke:#00e5ff,color:#ffffff,stroke-width:2px
    classDef externalNode fill:#2a1f0d,stroke:#ffb84d,color:#ffffff,stroke-width:2px
    classDef platformNode fill:#1a0f2e,stroke:#ff2fd0,color:#ffffff,stroke-width:2px

    class Games,Minerals,Blog,Static pageNode
    class Notion,Neon,Markdown dataNode
    class Blob,Wsrv externalNode
    class Hosting platformNode

    style SitePages fill:#0a0612,stroke:#ff2fd0,color:#ffffff
    style VercelPlatform fill:#0a0612,stroke:#ff2fd0,color:#ffffff
    style DataSources fill:#0a0612,stroke:#00e5ff,color:#ffffff
    style External fill:#0a0612,stroke:#ffb84d,color:#ffffff
`.trim()

const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

function HowItWorksRouteComponent() {
  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
            Under the Hood
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            How It Works
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            A map of how the pages, data, and hosting fit together.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className={headingClass}>The Architecture</h2>
        <p className="mt-4 leading-relaxed text-slate-300">
          This site is built with React and Tailwind, deployed on Vercel. The board game
          collection syncs live from Notion, while minerals and fossils data lives in a Neon
          Postgres database, with images served from Vercel Blob storage and resized on the fly.
        </p>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-[#ff2fd0]/40 bg-[#0a0612] p-4 shadow-glow-pink [&_svg]:mx-auto">
          <MermaidDiagram chart={architectureDiagram} useMaxWidth={false} />
        </div>
      </section>
    </div>
  )
}
