import type { ReactNode } from 'react'
import { cn } from 'cn'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  AiBrain02Icon,
  FlowConnectionIcon,
  Github01Icon,
  Layers01Icon,
  Rocket01Icon,
} from '@hugeicons/core-free-icons'
import { SectionHeading } from './SectionHeading'
import { StackFlowDiagram, type StackLayout } from './StackFlowDiagram'
import { CodeChip } from './stack/CodeChip'
import { StackGroups } from './stack/StackGroups'
import { aiWorkflowLayouts, buildDeployLayouts, dataFlowLayouts } from './stackDiagrams'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { compactHero, neonOutlineButton, pageContainer } from '../lib/styles'

const SOURCE_REPO_URL = 'https://github.com/wiserabidwombat/my-personal-site'

// Why I work this way, in my own words. Renders as its own paragraph in
// "How I Build With AI" (and nothing renders if it's ever left empty).
const WHY_I_WORK_THIS_WAY =
  'I built this site to learn how to work with AI, skills, MCPs, and other tools. I wanted to see how far I could get without writing the code myself, focusing instead on understanding agentic workflows, and to find out how effective I could be building a site this way.'

// Build & Deploy and How I Build With AI run left to right from md up, and
// top to bottom below it.
const DESKTOP_QUERY = '(min-width: 768px)'

function Section({ icon, title, children }: { icon: IconSvgElement; title: string; children: ReactNode }) {
  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <SectionHeading icon={icon}>{title}</SectionHeading>
      {children}
    </section>
  )
}

function Diagram({ layout, label }: { layout: StackLayout; label: string }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-black)] p-4">
      <StackFlowDiagram layout={layout} ariaLabel={label} />
    </div>
  )
}

export function Stack() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const layoutFor = <T extends { desktop: StackLayout; mobile: StackLayout }>(layouts: T) =>
    isDesktop ? layouts.desktop : layouts.mobile

  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
      <section className={compactHero}>
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">Under the Hood</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            About This Site
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-snug text-slate-300">
            The stack behind this site, from the components on screen to the data sources behind them.
          </p>
          <a
            href={SOURCE_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('mt-4 gap-2', neonOutlineButton)}
          >
            <HugeiconsIcon icon={Github01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
            View the source on GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </section>

      <Section icon={Layers01Icon} title="The Stack">
        <StackGroups />
      </Section>

      <Section icon={FlowConnectionIcon} title="Data Flow">
        <p className="mt-2 text-slate-300">
          Vercel's serverless API routes branch out to four data sources at request time: Notion, Neon, Hardcover,
          and Spotify. Only the minerals & fossils path touches image storage: its photos live in Vercel Blob and are
          resized by wsrv.nl. BoardGameGeek details are copied into Notion ahead of time by a local sync script, and
          box art loads straight from BoardGameGeek's image CDN.
        </p>
        <Diagram layout={layoutFor(dataFlowLayouts)} label="Site architecture and data flow diagram" />
      </Section>

      <Section icon={Rocket01Icon} title="Build & Deploy">
        <p className="mt-2 text-slate-300">
          Every push runs the same Vercel build: tests, a type check, the RSS feed, the production build, then a
          prerendered HTML page per route. The branch alone decides whether it lands as a preview or goes live.
        </p>
        <Diagram layout={layoutFor(buildDeployLayouts)} label="Build and deploy pipeline diagram" />
      </Section>

      <Section icon={AiBrain02Icon} title="How I Build With AI">
        <div className="mt-2 flex flex-col gap-4 leading-relaxed text-slate-300">
          <p>
            This site, and most of what's on it, is built with Claude Code. Work gets scoped and planned up front, then
            handed to subagents that implement and review in a loop until it holds up, before a PR ever opens.
          </p>
          <p>
            Larger features go through an orchestrator agent (<CodeChip>.claude/agents/orchestrator.md</CodeChip>) that
            breaks the work into steps and hands them one at a time to specialized subagents for architecture,
            implementation, and design, with a review agent checking each step's changes and sending fixes back until
            they pass. A custom design skill, <CodeChip>synthwave-ui</CodeChip>{' '}
            (<CodeChip>.claude/skills/synthwave-ui/SKILL.md</CodeChip>), keeps the palette and styling consistent
            from page to page.
          </p>
          {WHY_I_WORK_THIS_WAY && <p>{WHY_I_WORK_THIS_WAY}</p>}
        </div>
        <Diagram layout={layoutFor(aiWorkflowLayouts)} label="AI-assisted development workflow diagram" />
      </Section>
    </div>
  )
}
