import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Atom01Icon,
  PaintBoardIcon,
  ComponentIcon,
  Route01Icon,
  TriangleIcon,
  Notion01Icon,
  DatabaseLightningIcon,
} from '@hugeicons/core-free-icons'
import { Card, CardHeader, CardTitle, CardDescription } from '../../@/components/ui/card'
import { MermaidDiagram } from '../components/MermaidDiagram'
import { seoMeta } from '../lib/meta'

export const Route = createFileRoute('/stack')({
  head: () => ({
    meta: seoMeta({
      title: 'About This Site',
      description: 'The tools and technology stack behind this site.',
      path: '/stack',
    }),
  }),
  component: StackRouteComponent,
})

type Glow = 'pink' | 'cyan' | 'purple'

const glowStyles: Record<Glow, { ring: string; shadow: string; icon: string }> = {
  pink: {
    ring: 'ring-[var(--neon-pink)]/50',
    shadow: 'shadow-glow-pink',
    icon: 'text-[var(--neon-pink)]',
  },
  cyan: {
    ring: 'ring-[var(--laser-cyan)]/50',
    shadow: 'shadow-glow-cyan',
    icon: 'text-[var(--laser-cyan)]',
  },
  purple: {
    ring: 'ring-[var(--cyber-purple)]/50',
    shadow: 'shadow-glow-purple',
    icon: 'text-[var(--laser-cyan)]',
  },
}

const stack: { name: string; role: string; icon: typeof Atom01Icon; glow: Glow }[] = [
  {
    name: 'React',
    role: 'The UI library every component on this site is built with — from the navbar down to a single badge.',
    icon: Atom01Icon,
    glow: 'cyan',
  },
  {
    name: 'Tailwind CSS',
    role: 'Utility-first styling engine behind the layout, and the custom neon tokens and glow utilities in index.css.',
    icon: PaintBoardIcon,
    glow: 'pink',
  },
  {
    name: 'shadcn/ui',
    role: 'Accessible Radix-based primitives — Card, Badge, NavigationMenu — themed to this synthwave palette.',
    icon: ComponentIcon,
    glow: 'purple',
  },
  {
    name: 'TanStack Router',
    role: 'Type-safe, file-based routing. Every file in src/routes becomes a page, wired up automatically at build time.',
    icon: Route01Icon,
    glow: 'cyan',
  },
  {
    name: 'Vercel',
    role: 'Hosts and deploys this site, and runs the serverless API routes that talk to Notion and Neon.',
    icon: TriangleIcon,
    glow: 'pink',
  },
  {
    name: 'Notion',
    role: 'The database behind the game inventory — the board and PC game collections are queried straight from a Notion workspace.',
    icon: Notion01Icon,
    glow: 'purple',
  },
  {
    name: 'Neon',
    role: 'Serverless Postgres storing the minerals and fossils catalog, queried on demand with zero always-on infrastructure.',
    icon: DatabaseLightningIcon,
    glow: 'cyan',
  },
]

const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

// Deliberately flat (no subgraphs) and kept narrow -- unlike the wider,
// multi-subgraph diagram on /how-it-works, this one relies on Mermaid's
// default shrink-to-fit sizing (MermaidDiagram's useMaxWidth default) so it
// never needs horizontal scrolling, on desktop or mobile.
const dataFlowDiagram = `
flowchart TD
    Browser["🖥️ Browser"]
    ReactRouter["React + TanStack Router<br/>(File-based routing)"]
    Tailwind["Tailwind CSS + shadcn/ui<br/>(Styling &amp; Components)"]
    Vercel["▲ Vercel<br/>(Hosting + Serverless API Routes)"]
    Notion["Notion<br/>Board Game Collection"]
    Neon["Neon Postgres<br/>Minerals &amp; Fossils Catalog"]
    Blob["Vercel Blob<br/>(Image Storage)"]
    Wsrv["wsrv.nl<br/>(Image Resizing)"]

    Browser --> ReactRouter
    ReactRouter --> Tailwind
    ReactRouter --> Vercel
    Vercel --> Notion
    Vercel --> Neon
    Blob --> Wsrv

    classDef pinkNode fill:#1a0f2e,stroke:#ff2fd0,color:#ffffff,stroke-width:2px
    classDef cyanNode fill:#0d1b2a,stroke:#00e5ff,color:#ffffff,stroke-width:2px

    class Browser,ReactRouter,Tailwind,Notion,Neon pinkNode
    class Vercel,Blob,Wsrv cyanNode
`.trim()

function StackRouteComponent() {
  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
            Under the Hood
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            About This Site
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            A quick look at the stack powering this digital workspace — from the components on
            screen to the databases behind them.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className={headingClass}>The Stack</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((tech) => {
            const style = glowStyles[tech.glow]
            return (
              <Card
                key={tech.name}
                className={`${style.ring} ${style.shadow} bg-[var(--deep-space-purple)]/50 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1`}
              >
                <CardHeader>
                  <HugeiconsIcon
                    icon={tech.icon}
                    strokeWidth={2}
                    className={`size-7 ${style.icon}`}
                    aria-hidden="true"
                  />
                  <CardTitle className="mt-2 text-base font-bold text-slate-50">
                    {tech.name}
                  </CardTitle>
                  <CardDescription className="text-slate-300">{tech.role}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className={headingClass}>Data Flow</h2>
        <div className="mt-8 flex justify-center overflow-x-auto rounded-2xl border border-[#ff2fd0]/40 bg-[#0a0612] p-4 shadow-glow-pink">
          <MermaidDiagram chart={dataFlowDiagram} />
        </div>
      </section>
    </div>
  )
}
