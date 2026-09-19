import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Download04Icon } from '@hugeicons/core-free-icons'
import { Badge } from '../../@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '../../@/components/ui/card'
import { Button } from '../../@/components/ui/button'
import { seoMeta } from '../lib/meta'
import { summary, skillGroups, experience, credentials } from '../lib/resume-data'

export const Route = createFileRoute('/resume')({
  head: () => ({
    meta: seoMeta({
      title: 'Resume',
      description: "View Aaron Tilley's professional experience and technical skills.",
      path: '/resume',
    }),
  }),
  component: RouteComponent,
})

const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

function RouteComponent() {
  const [generatingPdf, setGeneratingPdf] = useState(false)

  // jsPDF is a large library only needed for this one interaction -- a
  // dynamic import keeps it out of the resume route's initial chunk, so
  // visitors who never click download never pay for it.
  async function handleDownload() {
    setGeneratingPdf(true)
    try {
      const { generateResumePdf } = await import('../lib/generate-resume-pdf')
      generateResumePdf()
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
            Resume
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            Software Developer
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{summary}</p>
          <Button
            onClick={handleDownload}
            disabled={generatingPdf}
            variant="outline"
            className="mt-8 gap-2 border-[var(--laser-cyan)] text-[var(--laser-cyan)] hover:bg-[var(--laser-cyan)]/10 hover:shadow-glow-cyan"
          >
            <HugeiconsIcon icon={Download04Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
            {generatingPdf ? 'Preparing…' : 'Download Resume (PDF)'}
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className={headingClass}>Technology Skills</h2>
        <div className="mt-6 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group) => (
            <div
              key={group.label}
              className="rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-5"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
                {group.label}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="shadow-glow-cyan">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className={headingClass}>Professional Experience</h2>
        <div className="mt-6 space-y-10">
          {experience.map((company) => (
            <div key={company.name}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-xl font-bold text-slate-50">
                  {company.name}
                  {company.location && (
                    <span className="font-normal text-slate-400"> — {company.location}</span>
                  )}
                </h3>
                <span className="text-sm font-medium text-[var(--laser-cyan)]">{company.dateRange}</span>
              </div>

              <div className="mt-4 space-y-6 border-l-2 border-[var(--cyber-purple)]/40 pl-6">
                {company.roles.map((role) => (
                  <div key={role.title + (role.dateRange ?? '')}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 className="font-semibold text-[var(--neon-pink)]">{role.title}</h4>
                      {role.dateRange && (
                        <span className="text-xs text-slate-400">{role.dateRange}</span>
                      )}
                    </div>
                    {role.projects ? (
                      <div className="mt-2 space-y-4">
                        {role.projects.map((project) => (
                          <div key={project.name}>
                            <p className="text-xs font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
                              Project: {project.name}
                            </p>
                            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
                              {project.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
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
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className={headingClass}>Education and Professional Development</h2>
        <div className="mx-auto mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
          {credentials.map((credential) => (
            <Card key={credential.title} className="ring-[var(--cyber-purple)]/40 shadow-glow-purple">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-100">
                  {credential.title}
                </CardTitle>
                {credential.detail && (
                  <CardDescription className="text-slate-300">{credential.detail}</CardDescription>
                )}
                <p className="mt-1 text-xs font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
                  {credential.date}
                  {credential.location && <> &middot; {credential.location}</>}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
