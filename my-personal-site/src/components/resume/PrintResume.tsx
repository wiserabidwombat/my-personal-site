import { forwardRef } from 'react'
import {
  fullName,
  heroTitle,
  summary,
  skillGroups,
  experience,
  credentials,
} from '../../lib/resume-data'

// Deliberately built with <div>/<span> instead of <h1>/<h2>/<p> tags: the
// site's global index.css sets unlayered margin/font-size rules on those bare
// tags (to keep the synthwave hero headings sized/spaced correctly) that
// would otherwise bleed into this print layout, since react-to-print copies
// the page's stylesheets into the print document and unlayered rules always
// beat Tailwind's layered utility classes regardless of specificity.
export const PrintResume = forwardRef<HTMLDivElement>(function PrintResume(_props, ref) {
  const sectionHeadingClass =
    'border-b border-gray-400 pb-0.5 text-[11pt] font-bold tracking-wide text-gray-900 uppercase'

  return (
    <div ref={ref} className="bg-white text-[10pt] leading-snug text-gray-900 font-serif">
      <div className="text-center">
        <div className="text-[20pt] font-bold">{fullName}</div>
        <div className="mt-0.5 text-[12pt] text-gray-700">{heroTitle}</div>
      </div>
      <div className="mt-2 text-gray-800">{summary}</div>

      <div className="mt-3">
        <div className={sectionHeadingClass}>Technology Skills</div>
        <div className="mt-1 space-y-0.5">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <span className="font-semibold">{group.label}: </span>
              <span>{group.skills.join(', ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <div className={sectionHeadingClass}>Professional Experience</div>
        <div className="mt-1.5 space-y-2.5">
          {experience.map((company) => (
            <div key={company.name}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-bold">
                  {company.name}
                  {company.location && (
                    <span className="font-normal text-gray-600"> — {company.location}</span>
                  )}
                </span>
                <span className="shrink-0 font-semibold text-gray-700">{company.dateRange}</span>
              </div>

              <div className="mt-1 space-y-1.5 pl-3">
                {company.roles.map((role) => (
                  <div key={role.title + (role.dateRange ?? '')}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-semibold italic">{role.title}</span>
                      {role.dateRange && (
                        <span className="shrink-0 text-gray-600">{role.dateRange}</span>
                      )}
                    </div>
                    {role.projects ? (
                      <div className="space-y-1">
                        {role.projects.map((project) => (
                          <div key={project.name}>
                            <div className="mt-0.5 text-[9pt] font-semibold text-gray-700">
                              Project: {project.name}
                            </div>
                            <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[9pt]">
                              {project.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-[9pt]">
                        {role.bullets?.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <div className={sectionHeadingClass}>Education and Professional Development</div>
        <div className="mt-1 space-y-0.5">
          {credentials.map((credential) => (
            <div key={credential.title} className="flex items-baseline justify-between gap-4">
              <span>
                <span className="font-semibold">{credential.title}</span>
                {credential.detail && <span className="text-gray-700"> — {credential.detail}</span>}
              </span>
              <span className="shrink-0 text-gray-600">
                {credential.date}
                {credential.location && <> &middot; {credential.location}</>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
