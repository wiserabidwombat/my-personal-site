import { cn } from 'cn'
import { ProjectCard } from './projects/ProjectCard'
import { projects } from './projects/projects-data'
import { compactHero, pageContainer, pageTitle, pageTitleLeading } from '../lib/styles'

export function Projects() {
  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      <section className={compactHero}>
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">Side Projects</p>
          <h1 className={cn(pageTitle, pageTitleLeading, 'mx-auto max-w-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]')}>
            Projects
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-snug text-slate-300">Things I've built outside of work.</p>
        </div>
      </section>

      <section className={cn(pageContainer, 'py-8 sm:py-10')}>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <li key={project.slug} className="flex">
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
