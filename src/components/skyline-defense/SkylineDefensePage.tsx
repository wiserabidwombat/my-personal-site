import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft02Icon, PauseIcon } from '@hugeicons/core-free-icons'
import { GameOverlay } from './GameOverlay'
import { useSkylineDefense } from './useSkylineDefense'

// Full-screen game page (the route sets bareLayout, so there's no navbar
// or footer): a slim top bar and the canvas. The page itself never
// scrolls, and the canvas takes every touch, so play on a phone doesn't
// scroll or zoom the page.
export function SkylineDefensePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { ui, start, resume, pause } = useSkylineDefense(containerRef, canvasRef)

  useEffect(() => {
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [])

  return (
    <div className="night-scene fixed inset-0 z-50 flex flex-col overscroll-none bg-[var(--deep-space-black)] text-slate-200">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--cyber-purple)]/40 px-4 py-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold whitespace-nowrap text-[var(--laser-cyan)] transition-colors hover:[text-shadow:var(--glow-cyan)] focus-visible:outline-2 focus-visible:outline-[var(--laser-cyan)]"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className="size-4" aria-hidden="true" />
          Back to site
        </Link>
        <h1 className="text-xs font-bold tracking-[0.2em] whitespace-nowrap text-[var(--neon-pink)] uppercase [text-shadow:var(--glow-pink)] sm:tracking-[0.3em]">
          Skyline Defense
        </h1>
        <button
          type="button"
          onClick={pause}
          disabled={ui.screen !== 'playing' || ui.paused}
          aria-label="Pause"
          className="inline-flex size-9 items-center justify-center rounded-full text-[var(--laser-cyan)] transition-opacity disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-[var(--laser-cyan)]"
        >
          <HugeiconsIcon icon={PauseIcon} strokeWidth={2} className="size-5" aria-hidden="true" />
        </button>
      </header>
      <div ref={containerRef} className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Skyline Defense game. Click or tap to fire; arrow keys aim, Space fires, P pauses."
          className="absolute inset-0 block size-full touch-none select-none outline-none"
        />
        <GameOverlay ui={ui} onStart={start} onResume={resume} />
      </div>
    </div>
  )
}
