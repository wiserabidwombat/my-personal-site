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
  Book01Icon,
  Github01Icon,
} from '@hugeicons/core-free-icons'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StackFlowDiagram } from '../components/StackFlowDiagram'
import { dataFlowDiagram, buildDeployDiagram, aiWorkflowDiagram } from '../components/stackDiagrams'
import { seoMeta, canonicalLink } from '../lib/meta'
import { neonOutlineButton } from '../lib/styles'
import { stackMeta } from './routeMeta'

export const Route = createFileRoute('/stack')({
  head: () => ({
    meta: seoMeta(stackMeta),
    links: [canonicalLink(stackMeta.path)],
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
    role: 'Serverless Postgres storing the minerals and fossils catalog — compute spins up to run a query and scales back to zero when idle, so nothing runs around the clock.',
    icon: DatabaseLightningIcon,
    glow: 'cyan',
  },
  {
    name: 'Hardcover',
    role: 'The reading library behind the books page — queried live from Hardcover\'s GraphQL API on every request, no database of its own.',
    icon: Book01Icon,
    glow: 'purple',
  },
]

const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

const SOURCE_REPO_URL = 'https://github.com/wiserabidwombat/my-personal-site'

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
          <a
            href={SOURCE_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-8 gap-2 ${neonOutlineButton}`}
          >
            <HugeiconsIcon icon={Github01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
            View the source on GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
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

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className={headingClass}>Data Flow</h2>
        <p className="mt-2 text-slate-300">
          Vercel's serverless API routes branch out to three independent data sources — only the
          fossils/minerals path touches image storage.
        </p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--neon-pink)]/40 bg-[var(--deep-space-black)] p-4 shadow-glow-pink">
          <StackFlowDiagram
            nodes={dataFlowDiagram.nodes}
            edges={dataFlowDiagram.edges}
            ariaLabel="Site architecture and data flow diagram"
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className={headingClass}>Build &amp; Deploy</h2>
        <p className="mt-2 text-slate-300">
          Every push runs the same Vercel build — tests, type checks, then the production build —
          and the branch alone decides whether it lands as a preview or goes live.
        </p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--laser-cyan)]/40 bg-[var(--deep-space-black)] p-4 shadow-glow-cyan">
          <StackFlowDiagram
            nodes={buildDeployDiagram.nodes}
            edges={buildDeployDiagram.edges}
            height={480}
            ariaLabel="Build and deploy pipeline diagram"
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className={headingClass}>How I Build With AI</h2>
        <p className="mt-2 text-slate-300">
          This site — and most of what's on it — is built with Claude Code. Work gets scoped and
          planned up front, then handed to subagents that implement and review in a loop until it
          holds up, before a PR ever opens.
        </p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-black)] p-4 shadow-glow-purple">
          <StackFlowDiagram
            nodes={aiWorkflowDiagram.nodes}
            edges={aiWorkflowDiagram.edges}
            height={680}
            ariaLabel="AI-assisted development workflow diagram"
          />
        </div>
      </section>
    </div>
  )
}
