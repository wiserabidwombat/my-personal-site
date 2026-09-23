import { createFileRoute } from '@tanstack/react-router'
import { cn } from 'cn'
import { Download04Icon, Github01Icon, Linkedin01Icon, Mail01Icon, Target01Icon } from '@hugeicons/core-free-icons'
import { ContactCard } from '../components/contact/ContactCard'
import { CopyButton } from '../components/contact/CopyButton'
import { SectionHeading } from '../components/SectionHeading'
import { bodyText, proseWidth } from '../components/about/typography'
import { useResumePdfDownload } from '../hooks/useResumePdfDownload'
import { contact, fullName } from '../lib/resume-data'
import { seoMeta, canonicalLink } from '../lib/meta'
import { compactHero, pageContainer } from '../lib/styles'
import { contactMeta } from './routeMeta'

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: seoMeta(contactMeta),
    links: [canonicalLink(contactMeta.path)],
  }),
  component: ContactRouteComponent,
})

// "What I'm open to" copy -- each string renders as its own paragraph.
const openTo = [
  "I'm open to full-time developer roles at the senior or lead level, as well as contract work. I'm available remotely, or for hybrid work local to Dallas–Fort Worth, with a focus on full-stack development and team leadership.",
  "If you have a role that fits, I'd love to hear from you. Please don't reach out about unrelated roles.",
]

const sectionClass = cn(pageContainer, 'py-8 sm:py-10')

// "github.com/octocat/" -> "@octocat"; falls back to a generic label.
function githubHandle(url: string) {
  const user = url.replace(/^https?:\/\/(www\.)?github\.com\/?/i, '').split('/')[0]
  return user ? `@${user}` : 'View profile'
}

function ContactRouteComponent() {
  const resume = useResumePdfDownload()
  const githubUrl = contact.githubUrl?.trim()
  // Resume is the last card; it spans both columns only when the card count
  // is odd (no GitHub card), so the grid never leaves an empty cell.
  const cardCount = githubUrl ? 4 : 3

  return (
    <div className="bg-[var(--deep-space-black)] text-left text-slate-200">
      <section className={compactHero}>
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">Contact</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            Let's Connect
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-slate-300">
            Interested in working together or just want to say hi? Reach out.
          </p>
        </div>
      </section>

      {/* Email and LinkedIn come from resume-data.ts's `contact`, the same
          values the resume PDF header uses, so the two can't drift. */}
      <section className={sectionClass}>
        <div className="grid gap-6 md:grid-cols-2">
          <ContactCard
            icon={Mail01Icon}
            title="Email"
            subtitle={contact.email}
            href={`mailto:${contact.email}`}
            action={<CopyButton text={contact.email} label="Copy email address" />}
          />
          <ContactCard
            icon={Linkedin01Icon}
            title={fullName}
            subtitle="Connect on LinkedIn"
            href={contact.linkedInUrl}
            external
          />
          {githubUrl && (
            <ContactCard
              icon={Github01Icon}
              title="GitHub"
              subtitle={githubHandle(githubUrl)}
              href={githubUrl}
              external
            />
          )}
          <ContactCard
            icon={Download04Icon}
            title="Resume"
            subtitle={resume.generating ? 'Preparing…' : 'Download PDF'}
            onClick={resume.download}
            busy={resume.generating}
            className={cn(cardCount % 2 === 1 && 'md:col-span-2')}
          />
        </div>
      </section>

      <section className={sectionClass}>
        <SectionHeading icon={Target01Icon}>What I'm open to</SectionHeading>
        <div className={cn('mt-4 flex flex-col gap-4', bodyText, proseWidth)}>
          {openTo.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  )
}
