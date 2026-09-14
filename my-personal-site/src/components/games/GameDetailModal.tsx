import { useState } from 'react'
import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ExternalLinkIcon, ImageNotFound01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../@/components/ui/dialog'
import { Badge } from '../../../@/components/ui/badge'
import { Input } from '../../../@/components/ui/input'
import type { BoardGame } from '../../types/board-game'
import { formatRange, formatCommaList, extractBggId } from './shared'

type Props = {
  game: BoardGame
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function GameDetailModal({ game, open, onOpenChange }: Props) {
  const [imgError, setImgError] = useState(false)
  const [forumQuery, setForumQuery] = useState('')
  const showThumbnail = Boolean(game.thumbnailUrl) && !imgError
  const bggId = extractBggId(game.bggLink)

  const notes = [game.notes, game.notes2, game.notes3].filter((note): note is string =>
    Boolean(note && note.trim())
  )

  function searchBggForums() {
    const term = forumQuery.trim()
    if (!term || !bggId) return
    const url = `https://boardgamegeek.com/forums/search?objectid=${bggId}&objecttype=thing&searchTerm=${encodeURIComponent(term)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setForumQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-full overflow-y-auto border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)] shadow-glow-purple sm:max-w-lg">
        <DialogHeader>
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
            <DialogTitle className="text-xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]">
              {game.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div>
          <p className="text-[10px] font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
            Search BGG Forums
          </p>
          <div className="relative mt-1.5">
            <Input
              value={forumQuery}
              onChange={(event) => setForumQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  searchBggForums()
                }
              }}
              disabled={!bggId}
              placeholder={bggId ? 'Search the forums…' : 'No BGG link for this game'}
              className="bg-[var(--deep-space-black)] pr-10 focus-visible:border-[var(--laser-cyan)] focus-visible:shadow-glow-cyan focus-visible:ring-[var(--laser-cyan)]/50"
            />
            <button
              type="button"
              onClick={searchBggForums}
              disabled={!bggId}
              aria-label="Search BGG forums"
              className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition-colors duration-300 hover:text-[var(--laser-cyan)] disabled:pointer-events-none disabled:opacity-50"
            >
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
            </button>
          </div>
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
                  <HugeiconsIcon
                    icon={ExternalLinkIcon}
                    strokeWidth={2}
                    className="size-3"
                    aria-hidden="true"
                  />
                </a>
              ) : (
                '—'
              )
            }
          />
          <Stat label="Players" value={formatRange(game.playersMin, game.playersMax)} />
          <Stat label="Playtime" value={formatRange(game.minPlaytime, game.maxPlaytime, 'min')} />
          <Stat label="Weight" value={game.weight != null ? game.weight.toFixed(2) : '—'} />
          <Stat label="Year Published" value={game.yearPublished ?? '—'} />
          <Stat label="Rating" value={game.rating != null ? `${game.rating.toFixed(2)}/10` : '—'} />
          <Stat label="Last Played" value={formatDate(game.lastPlayed) ?? '—'} />
          <Stat label="Designer" value={game.designer ?? '—'} />
          <Stat label="Publisher" value={formatCommaList(game.publisher)} />
        </div>

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

        {notes.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
              Notes
            </p>
            <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-slate-300">
              {notes.map((note, index) => (
                <p key={index}>{note}</p>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
