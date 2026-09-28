import type { KeyboardEventHandler, ReactNode } from 'react'

type Props = {
  title: string
  children: ReactNode
  // The panel's buttons (its primary action first). They sit in a footer
  // pinned below the scrolling content, so they're always visible without
  // scrolling, on any screen.
  actions?: ReactNode
  // Marks the whole dialog as owning the keyboard (see input.ts), with its
  // key handler, for panels whose keys overlap the game's.
  ownsKeys?: boolean
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>
}

// A dialog card over the canvas (start, pause, game over). Its content
// scrolls internally when taller than the play area, so the canvas never
// scrolls away on a phone; the actions footer stays put, with a subtle top
// border and a fade so a scrolled list reads as continuing beneath it.
export function Panel({ title, children, actions, ownsKeys = false, onKeyDown }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--deep-space-black)]/70 p-4">
      <div
        role="dialog"
        aria-label={title}
        data-owns-keys={ownsKeys ? '' : undefined}
        onKeyDown={onKeyDown}
        className="flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-[var(--neon-pink)]/50 bg-[var(--deep-space-purple)]/90 text-center shadow-glow-pink"
      >
        <div className={`min-h-0 overflow-y-auto overscroll-contain p-6 ${actions ? 'pb-5' : ''}`}>
          <h2 className="text-2xl font-extrabold tracking-wide text-[var(--neon-pink)] uppercase [text-shadow:var(--glow-pink)]">
            {title}
          </h2>
          {children}
        </div>
        {actions && (
          <div className="relative shrink-0 border-t border-[var(--neon-pink)]/30 px-6 py-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-[calc(100%+1px)] h-6 bg-gradient-to-t from-[var(--deep-space-purple)] to-transparent"
            />
            <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>
          </div>
        )}
      </div>
    </div>
  )
}
