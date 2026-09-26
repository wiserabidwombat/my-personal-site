import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { BookOpen01Icon, Compass01Icon, DiceIcon, GemIcon, MusicNote01Icon } from '@hugeicons/core-free-icons'
import { pageContainer } from '../../lib/styles'
import { SectionHeading } from '../SectionHeading'
import { gameCardBaseClass, gameCardInteractiveClass } from '../games/shared'

type Hobby = {
  to: '/games' | '/books' | '/music' | '/minerals_fossils'
  name: string
  description: string
  icon: IconSvgElement
}

const hobbies: Hobby[] = [
  { to: '/games', name: 'Games', description: 'My board game collection, favorites, and wish list.', icon: DiceIcon },
  { to: '/books', name: 'Books', description: "Everything I've read, synced from Hardcover.", icon: BookOpen01Icon },
  { to: '/music', name: 'Music', description: "What I'm listening to, live from Spotify.", icon: MusicNote01Icon },
  {
    to: '/minerals_fossils',
    name: 'Minerals & Fossils',
    description: 'Specimens from my rock and fossil collection.',
    icon: GemIcon,
  },
]

// The hobby pages, one card each: 4 across on desktop, 2 on tablet, 1 on
// mobile.
export function ExploreGrid() {
  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <SectionHeading icon={Compass01Icon}>Explore</SectionHeading>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {hobbies.map((hobby) => (
          <li key={hobby.to}>
            <Link to={hobby.to} className={cn(gameCardBaseClass, gameCardInteractiveClass, 'flex-col p-5')}>
              <HugeiconsIcon icon={hobby.icon} strokeWidth={2} className="size-6 text-[var(--laser-cyan)]" aria-hidden="true" />
              <p className="mt-3 font-semibold text-slate-50 group-hover:text-[var(--laser-cyan)]">{hobby.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">{hobby.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
