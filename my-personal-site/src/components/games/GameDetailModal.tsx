import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../@/components/ui/dialog'
import type { BoardGame } from '../../types/board-game'
import { GameDetailContent } from './GameDetailContent'

type Props = {
  game: BoardGame
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GameDetailModal({ game, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full overflow-visible border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)] p-0 shadow-glow-purple sm:max-w-lg">
        {/*
          The scrolling region is a separate, un-rounded element from the
          outer card so its native scrollbar isn't clipped by rounded-4xl
          (browsers clip a scrolling element's own scrollbar to its own
          border-radius). At sm+ it also shifts right via a negative margin
          so the scrollbar sits in the gap between the card's border and the
          dimmed overlay, rather than inset against the curve. On narrow
          viewports there isn't enough clearance for that gap to read
          cleanly, so it falls back to the inset behavior (rounded to match
          the card, scrollbar clipped to the curve like before).
        */}
        <div className="max-h-[85vh] overflow-y-auto rounded-4xl p-6 sm:-mr-3 sm:rounded-none sm:pr-9">
          {/* Accessible dialog title; GameDetailContent renders the matching visible heading. */}
          <DialogHeader>
            <DialogTitle className="sr-only">{game.name}</DialogTitle>
          </DialogHeader>
          <GameDetailContent game={game} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
