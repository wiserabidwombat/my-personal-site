import { HugeiconsIcon } from '@hugeicons/react'
import { ExternalLinkIcon } from '@hugeicons/core-free-icons'
import { Badge } from '../../../@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '../../../@/components/ui/card'
import { TagList } from './TagList'

type Props = {
  name: string
  category: 'Board Game' | 'PC Game'
  players: string
  rating: string
  status: string
  bggLink: string | null
  categories: string[]
  mechanics: string[]
  onCategoryTagClick: (tag: string) => void
  onMechanicTagClick: (tag: string) => void
}

export function GameCard({
  name,
  category,
  players,
  rating,
  status,
  bggLink,
  categories,
  mechanics,
  onCategoryTagClick,
  onMechanicTagClick,
}: Props) {
  return (
    <Card className="ring-white/10 transition-all duration-300 hover:ring-[var(--laser-cyan)]/60 hover:shadow-glow-cyan">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge variant="outline" className="text-[10px]">
              {category}
            </Badge>
            <CardTitle className="mt-2 text-base font-semibold text-slate-100">{name}</CardTitle>
          </div>
          {bggLink && (
            <a
              href={bggLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on BoardGameGeek`}
              className="inline-flex shrink-0 text-slate-400 transition-colors duration-300 hover:text-[var(--laser-cyan)]"
            >
              <HugeiconsIcon icon={ExternalLinkIcon} strokeWidth={2} className="size-4" aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
          <span>Players: {players}</span>
          <span>Rating: {rating}</span>
          <span>Status: {status}</span>
        </div>

        {(categories.length > 0 || mechanics.length > 0) && (
          <div className="mt-3 space-y-2">
            {categories.length > 0 && (
              <div>
                <p className="mb-1 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                  Categories
                </p>
                <TagList tags={categories} onTagClick={onCategoryTagClick} />
              </div>
            )}
            {mechanics.length > 0 && (
              <div>
                <p className="mb-1 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                  Mechanics
                </p>
                <TagList tags={mechanics} onTagClick={onMechanicTagClick} />
              </div>
            )}
          </div>
        )}
      </CardHeader>
    </Card>
  )
}
