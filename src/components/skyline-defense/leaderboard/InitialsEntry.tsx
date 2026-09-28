import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { neonOutlineButton } from '../../../lib/styles'

type Props = {
  // Starting initials (the player's last ones, or AAA).
  start: string
  busy: boolean
  error: string | null
  onSubmit: (initials: string) => void
  onSkip: () => void
}

const A = 'A'.charCodeAt(0)
const shift = (letter: string, by: number) => String.fromCharCode(A + ((letter.charCodeAt(0) - A + by + 26) % 26))
const SLOTS = [0, 1, 2]

// Arcade-style initials: three letter slots. Keyboard: Up/Down cycle the
// active letter (wrapping A-Z), Left/Right move between slots, typing a
// letter sets it and advances, Backspace goes back, Enter submits. Touch:
// up/down buttons around each slot. The container is marked data-owns-keys
// so the game's own key handlers (see input.ts) ignore keys typed here.
export function InitialsEntry({ start, busy, error, onSubmit, onSkip }: Props) {
  const [letters, setLetters] = useState(() => [...start])
  const [active, setActive] = useState(0)
  const slots = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    slots.current[active]?.focus()
  }, [active])

  const setLetter = (index: number, letter: string) =>
    setLetters((current) => current.map((value, i) => (i === index ? letter : value)))
  const cycle = (index: number, by: number) => {
    setActive(index)
    setLetter(index, shift(letters[index], by))
  }
  const submit = () => !busy && onSubmit(letters.join(''))

  // Handles one key; returns whether it was one of ours.
  const handleKey = (event: { key: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean }) => {
    const { key } = event
    let handled = true
    if (key === 'ArrowUp') cycle(active, 1)
    else if (key === 'ArrowDown') cycle(active, -1)
    else if (key === 'ArrowLeft' || key === 'Backspace') setActive(Math.max(0, active - 1))
    else if (key === 'ArrowRight') setActive(Math.min(2, active + 1))
    else if (key === 'Enter') submit()
    else if (/^[a-z]$/i.test(key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      setLetter(active, key.toUpperCase())
      setActive(Math.min(2, active + 1))
    } else handled = false
    return handled
  }
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!handleKey(event)) return
    event.preventDefault()
    event.stopPropagation()
  }

  // If focus falls out of the panel onto the page (say, a stray tap on the
  // backdrop as the game ends), the next key refocuses the active slot and
  // still counts. Caught on the window's capture phase and stopped there,
  // so it never reaches the game's key handlers either.
  useEffect(() => {
    const onWindowKey = (event: KeyboardEvent) => {
      if (document.activeElement && document.activeElement !== document.body) return
      slots.current[active]?.focus()
      if (!handleKey(event)) return
      event.preventDefault()
      event.stopPropagation()
    }
    window.addEventListener('keydown', onWindowKey, true)
    return () => window.removeEventListener('keydown', onWindowKey, true)
  })

  const arrow = (index: number, by: 1 | -1) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={`${by > 0 ? 'Next' : 'Previous'} letter for initial ${index + 1}`}
      onClick={() => cycle(index, by)}
      className="flex size-11 items-center justify-center rounded-lg text-[var(--laser-cyan)] transition-colors hover:bg-[var(--laser-cyan)]/10 focus-visible:outline-2 focus-visible:outline-[var(--laser-cyan)]"
    >
      <HugeiconsIcon icon={by > 0 ? ArrowUp01Icon : ArrowDown01Icon} strokeWidth={2} className="size-6" aria-hidden="true" />
    </button>
  )

  return (
    <div data-owns-keys onKeyDown={onKeyDown}>
      <p className="mt-2 text-sm text-slate-300">Enter your initials for the Top 10.</p>
      <div className="mt-3 flex justify-center gap-2">
        {SLOTS.map((index) => (
          <div key={index} className="flex flex-col items-center">
            {arrow(index, 1)}
            <div
              ref={(element) => {
                slots.current[index] = element
              }}
              role="spinbutton"
              tabIndex={0}
              aria-label={`Initial ${index + 1} of 3`}
              aria-valuenow={letters[index].charCodeAt(0) - A + 1}
              aria-valuemin={1}
              aria-valuemax={26}
              aria-valuetext={letters[index]}
              onFocus={() => setActive(index)}
              className={`flex h-14 w-12 items-center justify-center rounded-lg border-2 bg-[var(--deep-space-black)]/60 [font-family:var(--mono)] text-3xl font-bold text-slate-50 outline-none ${
                index === active
                  ? 'animate-[initials-blink_1s_steps(1)_infinite] border-[var(--laser-cyan)] motion-reduce:animate-none'
                  : 'border-[var(--cyber-purple)]/50'
              }`}
            >
              {letters[index]}
            </div>
            {arrow(index, -1)}
          </div>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        Initial {active + 1}: {letters[active]}
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-[var(--neon-pink)]">
          {error}
        </p>
      )}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button type="button" onClick={submit} disabled={busy} className={neonOutlineButton}>
          {busy ? 'Saving...' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={busy}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-[var(--laser-cyan)] disabled:opacity-50"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
