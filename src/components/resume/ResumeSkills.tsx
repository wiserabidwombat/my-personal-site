import { OutlinePill } from '../OutlinePill'
import { skillGroups } from '../../lib/resume-data'

// Same card treatment as About's Technical Toolkit: four groups in a 2x2
// grid on desktop, stacked on mobile, with outlined pills.
export function ResumeSkills() {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      {skillGroups.map((group) => (
        <div
          key={group.label}
          className="rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-5"
        >
          <h3 className="text-sm font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">{group.label}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.skills.map((skill) => (
              <OutlinePill key={skill}>{skill}</OutlinePill>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
