import type { ReactNode } from 'react'
import { cn } from 'cn'
import type { IconSvgElement } from '@hugeicons/react'
import { Activity01Icon, BookOpen01Icon, Brain01Icon, DiceIcon, FishingRodIcon, HeadphonesIcon } from '@hugeicons/core-free-icons'
import { useCurrentlyReading } from '../../hooks/useCurrentlyReading'
import { useMusic } from '../../hooks/useMusic'
import { currentlyLoving } from '../../data/currently-loving'
import { liveStatusFallbacks, manualStatus } from '../../data/home-status'
import { pageContainer } from '../../lib/styles'
import { SectionHeading } from '../SectionHeading'
import { NowListening } from './NowListening'
import { StatusCard } from './StatusCard'
import { statusCardClass, statusGridClass } from './statusGrid'

type Card = {
  key: string
  icon: IconSvgElement
  label: string
  href?: string
  linkLabel?: string
  loading?: boolean
  content: ReactNode
}

function Value({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <p className="line-clamp-3 leading-snug" title={title}>
      {children}
    </p>
  )
}

// Now Playing, Now Reading, and Now Listening come from live data (with a
// fallback from src/data/home-status.ts, or hidden, if it can't load); Now
// Casting and Now Learning are manual text from that same file. A card
// whose value is empty is left out, and the grid adapts to how many cards
// remain (see statusGrid.ts).
export function CurrentStatus() {
  const reading = useCurrentlyReading()
  const music = useMusic()
  const cards: Card[] = []

  cards.push({
    key: 'playing',
    icon: DiceIcon,
    label: 'Now Playing',
    href: '/games',
    linkLabel: 'Games page',
    content: <Value>{currentlyLoving.name}</Value>,
  })

  const [firstBook, ...moreBooks] = reading.books
  if (reading.status === 'loading') {
    cards.push({ key: 'reading', icon: BookOpen01Icon, label: 'Now Reading', loading: true, content: null })
  } else if (firstBook) {
    cards.push({
      key: 'reading',
      icon: BookOpen01Icon,
      label: 'Now Reading',
      href: '/books',
      linkLabel: 'Books page',
      content: (
        <Value title={reading.books.map((book) => book.title).join('\n')}>
          {firstBook.title}
          {moreBooks.length > 0 && <span className="text-slate-400"> +{moreBooks.length} more</span>}
        </Value>
      ),
    })
  } else if (liveStatusFallbacks.nowReading) {
    cards.push({
      key: 'reading',
      icon: BookOpen01Icon,
      label: 'Now Reading',
      href: '/books',
      linkLabel: 'Books page',
      content: <Value>{liveStatusFallbacks.nowReading}</Value>,
    })
  }

  const lastTrack = music.status === 'ready' ? music.music.recentlyPlayed?.[0] : undefined
  if (music.status === 'loading') {
    cards.push({ key: 'listening', icon: HeadphonesIcon, label: 'Now Listening', loading: true, content: null })
  } else if (lastTrack) {
    cards.push({
      key: 'listening',
      icon: HeadphonesIcon,
      label: 'Now Listening',
      href: '/music',
      linkLabel: 'Music page',
      content: <NowListening track={lastTrack} />,
    })
  } else if (liveStatusFallbacks.nowListening) {
    cards.push({
      key: 'listening',
      icon: HeadphonesIcon,
      label: 'Now Listening',
      href: '/music',
      linkLabel: 'Music page',
      content: <Value>{liveStatusFallbacks.nowListening}</Value>,
    })
  }

  const manual: [string, IconSvgElement, string, typeof manualStatus.nowCasting][] = [
    ['casting', FishingRodIcon, 'Now Casting', manualStatus.nowCasting],
    ['learning', Brain01Icon, 'Now Learning', manualStatus.nowLearning],
  ]
  for (const [key, icon, label, status] of manual) {
    if (status.value) cards.push({ key, icon, label, href: status.href, content: <Value>{status.value}</Value> })
  }

  return (
    <section className={cn(pageContainer, 'py-8 sm:py-10')}>
      <SectionHeading icon={Activity01Icon}>Current Status</SectionHeading>
      <ul className={cn('mt-6 grid gap-4', statusGridClass(cards.length))}>
        {cards.map((card, index) => (
          <StatusCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            href={card.href}
            linkLabel={card.linkLabel}
            loading={card.loading}
            className={statusCardClass(cards.length, index)}
          >
            {card.content}
          </StatusCard>
        ))}
      </ul>
    </section>
  )
}
