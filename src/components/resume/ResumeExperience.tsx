import { experience } from '../../lib/resume-data'

function BulletList({ bullets }: { bullets: string[] }) {
  return (
    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
      {bullets.map((bullet) => (
        <li key={bullet}>{bullet}</li>
      ))}
    </ul>
  )
}

export function ResumeExperience() {
  return (
    <div className="mt-6 space-y-10">
      {experience.map((company) => (
        <div key={company.name}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-xl font-bold text-slate-50">
              {company.name}
              {company.location && <span className="font-normal text-slate-400"> — {company.location}</span>}
            </h3>
            <span className="text-sm font-medium text-[var(--laser-cyan)]">{company.dateRange}</span>
          </div>

          <div className="mt-4 space-y-6 border-l-2 border-[var(--cyber-purple)]/40 pl-6">
            {company.roles.map((role) => (
              <div key={role.title + (role.dateRange ?? '')}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h4 className="font-semibold text-[var(--neon-pink)]">{role.title}</h4>
                  {role.dateRange && <span className="text-xs text-slate-400">{role.dateRange}</span>}
                </div>
                {role.projects ? (
                  <div className="mt-2 space-y-4">
                    {role.projects.map((project) => (
                      <div key={project.name}>
                        <p className="text-xs font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
                          Project: {project.name}
                        </p>
                        <BulletList bullets={project.bullets} />
                      </div>
                    ))}
                  </div>
                ) : (
                  role.bullets && <BulletList bullets={role.bullets} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
