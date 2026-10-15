import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  Award01Icon,
  CheckmarkCircle02Icon,
  Github01Icon,
  Image01Icon,
  Layers01Icon,
  Shield01Icon,
  SmartPhone01Icon,
  Wrench01Icon,
} from '@hugeicons/core-free-icons'
import { SectionHeading } from '../SectionHeading'
import { pageContainer } from '../../lib/styles'
import { PinballLabCredits } from './PinballLabCredits'
import { PhoneScreenshots } from './PhoneScreenshots'
import { PinballLabHero } from './PinballLabHero'
import { pinballLab } from './projects-data'
import { pinballBuildList, pinballRequirements, pinballScreenshots, pinballTables } from './pinball-lab-data'

// Prose width cap (~70 characters), shared by the page's text blocks.
const prose = 'max-w-[70ch] leading-relaxed text-slate-300'

const footerLink =
  'inline-flex items-center gap-1.5 text-sm font-medium text-[var(--laser-cyan)] transition-colors hover:text-[var(--neon-pink)]'

function Section({ icon, title, children }: { icon: IconSvgElement; title: string; children: ReactNode }) {
  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <SectionHeading icon={icon}>{title}</SectionHeading>
      {children}
    </section>
  )
}

function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className={cn(prose, 'mt-4 flex flex-col gap-3')}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
            className="mt-1 size-4 shrink-0 text-[var(--laser-cyan)]"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function PinballLab() {
  return (
    <div className="bg-[var(--deep-space-black)] text-slate-200">
      <PinballLabHero />

      <Section icon={Image01Icon} title="Screenshots">
        <PhoneScreenshots screenshots={pinballScreenshots} label="Pinball Lab screenshots" />
      </Section>

      <Section icon={Layers01Icon} title="The tables">
        <ol className="mt-4 flex flex-col gap-4">
          {pinballTables.map((table) => (
            <li
              key={table.name}
              className="flex gap-4 rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-5"
            >
              <span aria-hidden="true" className="font-mono text-lg font-bold text-[var(--laser-cyan)]">
                {table.number}
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-50">{table.name}</h3>
                <p className={cn(prose, 'mt-1')}>{table.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section icon={Wrench01Icon} title="How it's built">
        <p className={cn(prose, 'mt-2')}>
          No game engine: just Apple's own frameworks, with Blender for the art and Python for the sounds and the
          tuning.
        </p>
        <CheckList items={pinballBuildList} />
      </Section>

      <Section icon={SmartPhone01Icon} title="Requirements">
        <CheckList items={pinballRequirements} />
      </Section>

      <Section icon={Award01Icon} title="Credits">
        <PinballLabCredits className={cn(prose, 'mt-4')} />
      </Section>

      <footer className={cn(pageContainer, 'pt-2 pb-12')}>
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--cyber-purple)]/40 pt-6">
          <Link to="/projects/pinball-lab/privacy" className={footerLink}>
            <HugeiconsIcon icon={Shield01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
            Privacy Policy
          </Link>
          {pinballLab.links.github && (
            <a href={pinballLab.links.github} target="_blank" rel="noopener noreferrer" className={footerLink}>
              <HugeiconsIcon icon={Github01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
              GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </footer>
    </div>
  )
}
