import { OutlinePill } from '../OutlinePill'

const toolkit = [
  {
    category: 'Frontend Architecture',
    skills: ['React', 'Angular', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'HTML5', 'CSS3'],
  },
  {
    category: 'Data & Cloud',
    skills: ['SQL', 'Data Analytics', 'AWS', 'CI/CD'],
  },
  {
    category: 'Enterprise CRM & Platform',
    skills: ['Dynamics 365', 'Power Apps', 'Power Automate', '.NET / C#'],
  },
  {
    category: 'Emerging Tech',
    skills: ['AI-Assisted Development', 'Prompt Engineering', 'LLM Workflow Automation'],
  },
]

export function ToolkitGrid() {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      {toolkit.map((group) => (
        <div
          key={group.category}
          className="rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-5"
        >
          <h3 className="text-sm font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
            {group.category}
          </h3>
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
