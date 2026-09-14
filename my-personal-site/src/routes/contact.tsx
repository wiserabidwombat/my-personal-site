import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Mail01Icon, Linkedin01Icon } from '@hugeicons/core-free-icons'
import { pageTitle } from '../lib/title'

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [{ title: pageTitle('Contact') }],
  }),
  component: ContactRouteComponent,
})

type Glow = 'pink' | 'cyan'

const glowStyles: Record<Glow, { ring: string; iconRing: string; icon: string; text: string }> = {
  cyan: {
    ring: 'hover:border-[var(--laser-cyan)]/60 hover:shadow-glow-cyan',
    iconRing: 'ring-[var(--laser-cyan)]/40',
    icon: 'text-[var(--laser-cyan)]',
    text: 'group-hover:text-[var(--laser-cyan)]',
  },
  pink: {
    ring: 'hover:border-[var(--neon-pink)]/60 hover:shadow-glow-pink',
    iconRing: 'ring-[var(--neon-pink)]/40',
    icon: 'text-[var(--neon-pink)]',
    text: 'group-hover:text-[var(--neon-pink)]',
  },
}

const contactLinks: {
  label: string
  display: string
  href: string
  icon: typeof Mail01Icon
  external?: boolean
  glow: Glow
}[] = [
  {
    label: 'Email',
    display: 'aaronltilley1@gmail.com',
    href: 'mailto:aaronltilley1@gmail.com',
    icon: Mail01Icon,
    glow: 'cyan',
  },
  {
    label: 'LinkedIn',
    display: 'linkedin.com/in/aaron-tilley-46b16112',
    href: 'https://www.linkedin.com/in/aaron-tilley-46b16112/',
    icon: Linkedin01Icon,
    external: true,
    glow: 'pink',
  },
]

function ContactRouteComponent() {
  return (
    <div className="min-h-screen bg-[var(--deep-space-black)] text-left text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
            Contact
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            Let's Connect
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Interested in working together or just want to say hi? Reach out.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {contactLinks.map((link) => {
            const style = glowStyles[link.glow]
            return (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className={`group flex min-w-0 items-center gap-4 rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 px-6 py-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${style.ring}`}
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--deep-space-black)] ring-1 ${style.iconRing}`}
                >
                  <HugeiconsIcon
                    icon={link.icon}
                    strokeWidth={2}
                    className={`size-6 ${style.icon}`}
                    aria-hidden="true"
                  />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-base font-bold text-slate-50">{link.label}</span>
                  <span
                    className={`truncate text-sm text-slate-400 transition-colors duration-300 ${style.text}`}
                  >
                    {link.display}
                  </span>
                </span>
              </a>
            )
          })}
        </div>
      </section>
    </div>
  )
}
