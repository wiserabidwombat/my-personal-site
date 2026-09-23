import { createFileRoute } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { Briefcase01Icon, Download04Icon, Mortarboard02Icon, Wrench01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '../components/SectionHeading'
import { ResumeExperience } from '../components/resume/ResumeExperience'
import { ResumeSkills } from '../components/resume/ResumeSkills'
import { ResumeEducation } from '../components/resume/ResumeEducation'
import { useResumePdfDownload } from '../hooks/useResumePdfDownload'
import { seoMeta, canonicalLink } from '../lib/meta'
import { heroTitle, summary } from '../lib/resume-data'
import { neonOutlineButton, pageContainer } from '../lib/styles'
import { resumeMeta } from './routeMeta'

export const Route = createFileRoute('/resume')({
  head: () => ({
    meta: seoMeta(resumeMeta),
    links: [canonicalLink(resumeMeta.path)],
  }),
  component: RouteComponent,
})

// Same container, left edge, and mobile-tightened padding as About.
const sectionClass = cn(pageContainer, 'py-8 sm:py-12')

function RouteComponent() {
  const { download: handleDownload, generating: generatingPdf } = useResumePdfDownload()

  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
            Resume
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{summary}</p>
          <Button onClick={handleDownload} disabled={generatingPdf} className={cn(neonOutlineButton, 'mt-8 gap-2')}>
            <HugeiconsIcon icon={Download04Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
            {generatingPdf ? 'Preparing…' : 'Download Resume (PDF)'}
          </Button>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionHeading icon={Briefcase01Icon}>Professional Experience</SectionHeading>
        <ResumeExperience />
      </section>

      <section className={sectionClass}>
        <SectionHeading icon={Wrench01Icon}>Technology Skills</SectionHeading>
        <ResumeSkills />
      </section>

      <section className={sectionClass}>
        <SectionHeading icon={Mortarboard02Icon}>Education &amp; Certifications</SectionHeading>
        <ResumeEducation />
      </section>
    </div>
  )
}
