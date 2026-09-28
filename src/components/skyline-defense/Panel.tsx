import type { ReactNode } from 'react'

// A dialog card over the canvas (start, pause, game over). It scrolls
// internally when its content is taller than the play area, so the canvas
// never scrolls away on a phone.
export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--deep-space-black)]/70 p-4">
      <div
        role="dialog"
        aria-label={title}
        className="max-h-full w-full max-w-sm overflow-y-auto overscroll-contain rounded-2xl border border-[var(--neon-pink)]/50 bg-[var(--deep-space-purple)]/90 p-6 text-center shadow-glow-pink"
      >
        <h2 className="text-2xl font-extrabold tracking-wide text-[var(--neon-pink)] uppercase [text-shadow:var(--glow-pink)]">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}
