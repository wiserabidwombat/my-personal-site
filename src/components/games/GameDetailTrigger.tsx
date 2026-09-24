import { useState, type ReactNode } from 'react'
import { cn } from 'cn'
import type { BoardGame } from '../../types/board-game'
import { GameDetailModal } from './GameDetailModal'
import { gameCardBaseClass, gameCardInteractiveClass } from './shared'

type Props = {
  // Undefined when a hand-picked game (Favorites, Want to Play) isn't in the
  // Notion data: then there are no details to show, so it renders as a
  // plain, non-interactive card instead of a button that opens nothing.
  game: BoardGame | undefined
  className?: string
  children: ReactNode
}

// Makes a whole card one target that opens the game's detail dialog (which
// has the BGG link, notes, and full stats), with nothing interactive nested
// inside it. Shared by the inventory cards and every top section.
export function GameDetailTrigger({ game, className, children }: Props) {
  const [open, setOpen] = useState(false)

  if (!game) return <div className={cn(gameCardBaseClass, className)}>{children}</div>

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className={cn(gameCardBaseClass, gameCardInteractiveClass, className)}
      >
        {children}
      </div>
      <GameDetailModal game={game} open={open} onOpenChange={setOpen} />
    </>
  )
}
