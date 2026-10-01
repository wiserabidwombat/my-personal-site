import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowUpRight01Icon, Github01Icon, Image01Icon } from '@hugeicons/core-free-icons'
import { headingText } from '../../lib/styles'
import { ProjectPills } from './ProjectPills'
import type { Project } from './projects-data'

type Props = {
  project: Project
}

const secondaryLinkClass =
  'relative z-10 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-[var(--laser-cyan)] transition-colors hover:text-[var(--neon-pink)] focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:outline-none'

// Same card treatment as Blog and Contact: one restrained border color,
// slight lift and brighter border on hover or keyboard focus. The project
// name is a "stretched" link to its detail page (its ::after covers the
// card), so the GitHub/external links can sit above it as siblings rather
// than nested inside it.
export function ProjectCard({ project }: Props) {
  const { image, links } = project

  return (
    <article
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 transition duration-300',
        links.detail && 'hover:-translate-y-1 hover:border-[var(--laser-cyan)]/70 motion-reduce:hover:translate-y-0',
        'has-[.card-target:focus-visible]:-translate-y-1 has-[.card-target:focus-visible]:border-[var(--laser-cyan)]/70',
      )}
    >
      {image.src ? (
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className="aspect-video w-full object-cover transition-[filter] duration-300 group-hover:brightness-110"
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-[var(--deep-space-black)]/60 text-slate-500">
          <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="size-10" aria-hidden="true" />
          <span className="sr-only">Image coming soon</span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h2 className={cn(headingText, 'font-bold text-slate-50')}>
          {links.detail ? (
            <Link
              to={links.detail.to}
              className="card-target after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[var(--laser-cyan)] focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-[var(--deep-space-black)]"
            >
              {project.name}
            </Link>
          ) : (
            project.name
          )}
        </h2>
        <p className="text-slate-300">{project.summary}</p>
        <ProjectPills project={project} />

        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-2">
          {links.detail && (
            // Visual cue only; the stretched name link above is what's announced.
            <span
              aria-hidden="true"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors group-hover:text-[var(--laser-cyan)]"
            >
              {links.detail.label} &rarr;
            </span>
          )}
          {links.github && (
            <a href={links.github} target="_blank" rel="noopener noreferrer" className={secondaryLinkClass}>
              <HugeiconsIcon icon={Github01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
              GitHub
              <span className="sr-only"> repository for {project.name} (opens in a new tab)</span>
            </a>
          )}
          {links.external && (
            <a href={links.external.href} target="_blank" rel="noopener noreferrer" className={secondaryLinkClass}>
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
              {links.external.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
