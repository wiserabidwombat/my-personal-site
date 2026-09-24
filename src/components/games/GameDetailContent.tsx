import { useState } from 'react'
import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ExternalLinkIcon, ImageNotFound01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import type { BoardGame } from '../../types/board-game'
import { ExpandableText } from './ExpandableText'
import { formatRange, formatCommaList, extractBggId, formatPlaytime } from './shared'

type Props = {
  game: BoardGame
}

function formatDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-slate-200">{value}</p>
    </div>
  )
}

// The thumbnail+name header is a plain heading rather than the Dialog
// primitive's Title, so this content can be embedded inside a dialog that
// already has its own accessible title (e.g. the random game picker) without
// two competing Titles fighting over the dialog's aria-labelledby.
export function GameDetailContent({ game }: Props) {
  const [imgError, setImgError] = useState(false)
  const [forumQuery, setForumQuery] = useState('')
  const showThumbnail = Boolean(game.thumbnailUrl) && !imgError
  const bggId = extractBggId(game.bggLink)

  // BGG's publisher description, split across Notes / Notes 2 / Notes 3
  // only because Notion caps a rich-text value at 2,000 characters -- the
  // parts continue mid-word, so they're joined back with no separator.
  const description = [game.notes, game.notes2, game.notes3].filter(Boolean).join('').trim()

  function searchBggForums() {
    const term = forumQuery.trim()
    if (!term || !bggId) return
    const url = `https://boardgamegeek.com/forums/search?objectid=${bggId}&objecttype=thing&searchTerm=${encodeURIComponent(term)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setForumQuery('')
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--deep-space-black)] ring-1 ring-[var(--cyber-purple)]/40">
          {showThumbnail ? (
            <img
              src={game.thumbnailUrl ?? undefined}
              alt={`${game.name} thumbnail`}
              className="size-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <HugeiconsIcon
              icon={ImageNotFound01Icon}
              strokeWidth={1.5}
              className="size-8 text-slate-500"
              aria-hidden="true"
            />
          )}
        </div>
        <h2 className="text-xl font-bold text-[var(--neon-pink)]">
          {game.name}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Status" value={game.status ?? '—'} />
        <Stat label="Condition" value={game.condition ?? '—'} />
        <Stat
          label="BGG Link"
          value={
            game.bggLink ? (
              <a
                href={game.bggLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--laser-cyan)] hover:underline"
              >
                View on BGG
                <HugeiconsIcon icon={ExternalLinkIcon} strokeWidth={2} className="size-3" aria-hidden="true" />
              </a>
            ) : (
              '—'
            )
          }
        />
        <Stat label="Players" value={formatRange(game.playersMin, game.playersMax)} />
        <Stat label="Playtime" value={formatPlaytime(game)} />
        <Stat label="Weight" value={game.weight != null ? game.weight.toFixed(2) : '—'} />
        <Stat label="Year Published" value={game.yearPublished ?? '—'} />
        <Stat label="BGG rating" value={game.rating != null ? `${game.rating.toFixed(2)}/10` : '—'} />
        <Stat label="Last Played" value={formatDate(game.lastPlayed) ?? '—'} />
        <Stat label="Designer" value={game.designer ?? '—'} />
        <Stat label="Publisher" value={formatCommaList(game.publisher)} />
      </div>

      {/* Secondary tool, so it sits below the details and stays quiet: a
          compact row with a plain border focus, no glow. */}
      {bggId && (
        <div>
          <label
            htmlFor={`forum-search-${game.id}`}
            className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase"
          >
            Search BGG forums
          </label>
          <div className="relative mt-1 max-w-xs">
            <input
              id={`forum-search-${game.id}`}
              type="search"
              value={forumQuery}
              onChange={(event) => setForumQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  searchBggForums()
                }
              }}
              placeholder="Search the forums…"
              className="h-8 w-full rounded-full border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-black)] pr-8 pl-3 text-xs text-slate-200 placeholder:text-slate-500 focus-visible:border-[var(--laser-cyan)]/70 focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={searchBggForums}
              aria-label="Search BGG forums"
              className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors duration-300 hover:text-[var(--laser-cyan)]"
            >
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {game.categories.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
            Categories
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {game.categories.map((category) => (
              <Badge key={category} variant="outline" className="text-[10px]">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {game.mechanics.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
            Mechanics
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {game.mechanics.map((mechanic) => (
              <Badge key={mechanic} variant="outline" className="text-[10px]">
                {mechanic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {description && (
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
            Description
          </p>
          <ExpandableText text={description} className="mt-1.5 text-sm leading-relaxed text-slate-300" />
        </div>
      )}
    </div>
  )
}
