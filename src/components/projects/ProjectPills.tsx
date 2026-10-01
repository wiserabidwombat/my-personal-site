import { cn } from 'cn'
import { OutlinePill } from '../OutlinePill'
import { outlinePill } from '../../lib/styles'
import type { Project } from './projects-data'

type Props = {
  project: Pick<Project, 'status' | 'tags'>
  className?: string
}

// Status pill (pink outline, so it reads apart from the tech pills) followed
// by the cyan platform/tech pills.
export function ProjectPills({ project, className }: Props) {
  return (
    <ul className={cn('flex flex-wrap gap-2', className)} aria-label="Status and platforms">
      <li>
        <span className={cn(outlinePill, 'border-[var(--neon-pink)] text-[var(--neon-pink)]')}>{project.status}</span>
      </li>
      {project.tags.map((tag) => (
        <li key={tag}>
          <OutlinePill>{tag}</OutlinePill>
        </li>
      ))}
    </ul>
  )
}
