import { useCallback, useEffect, useRef, useState, type KeyboardEventHandler, type ReactNode } from 'react'

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
  // Decorative extras positioned against the panel's box (e.g. seasonal
  // sprites just outside its edges), not clipped by its rounded border.
  decor?: ReactNode
}

// Leeway for "scrolled to the bottom" (fractional scroll positions).
const BOTTOM_SLACK = 2

// Whether the content overflows the scroll area, re-checked whenever
// either one resizes (a ResizeObserver on both, so content changes like the
// leaderboard finishing loading count too); and whether it's scrolled to
// the bottom.
function useOverflow() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)
  const [atBottom, setAtBottom] = useState(false)

  const measure = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setOverflows(el.scrollHeight > el.clientHeight + 1)
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - BOTTOM_SLACK)
  }, [])

  useEffect(() => {
    const scroll = scrollRef.current
    const content = contentRef.current
    if (!scroll || !content) return
    // Fires once on observe, then on every size change.
    const observer = new ResizeObserver(measure)
    observer.observe(scroll)
    observer.observe(content)
    return () => observer.disconnect()
  }, [measure])

  return { scrollRef, contentRef, overflows, atBottom, onScroll: measure }
}

// A dialog card over the canvas (start, pause, game over). Its content
// scrolls internally when taller than the play area, so the canvas never
// scrolls away on a phone; the actions footer stays put. Only when the
// content actually overflows does the footer show a subtle top divider,
// plus a fade (until scrolled to the bottom) so the list reads as
// continuing beneath it. The divider's space is always reserved, so
// nothing shifts when it appears.
export function Panel({ title, children, actions, ownsKeys = false, onKeyDown, decor }: Props) {
  const { scrollRef, contentRef, overflows, atBottom, onScroll } = useOverflow()
  const showFade = overflows && !atBottom
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--deep-space-black)]/70 p-4">
      {/* The panel's box: the dialog fills it (and shrinks to its max
          height), and `decor` is positioned against it. */}
      <div className="relative flex max-h-full w-full max-w-sm flex-col">
        <div
          role="dialog"
          aria-label={title}
          data-owns-keys={ownsKeys ? '' : undefined}
          onKeyDown={onKeyDown}
          className="flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-[var(--neon-pink)]/50 bg-[var(--deep-space-purple)]/90 text-center shadow-glow-pink"
        >
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className={`min-h-0 overflow-y-auto overscroll-contain p-6 ${actions ? 'pb-5' : ''}`}
          >
            <div ref={contentRef}>
              <h2 className="text-2xl font-extrabold tracking-wide text-[var(--neon-pink)] uppercase [text-shadow:var(--glow-pink)]">
                {title}
              </h2>
              {children}
            </div>
          </div>
          {actions && (
            <div
              data-overflow={overflows ? '' : undefined}
              className={`relative shrink-0 border-t px-6 py-4 transition-colors ${
                overflows ? 'border-[var(--neon-pink)]/30' : 'border-transparent'
              }`}
            >
              <div
                aria-hidden="true"
                data-fade={showFade ? '' : undefined}
                className={`pointer-events-none absolute inset-x-0 bottom-[calc(100%+1px)] h-6 bg-gradient-to-t from-[var(--deep-space-purple)] to-transparent transition-opacity motion-reduce:transition-none ${
                  showFade ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>
            </div>
          )}
        </div>
        {decor}
      </div>
    </div>
  )
}
