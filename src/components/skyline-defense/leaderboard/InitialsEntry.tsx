import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { neonOutlineButton } from '../../../lib/styles'
import { Panel } from '../Panel'
import { LetterSlot } from './LetterSlot'

type Props = {
  title: string
  // Shown above the slots (the score).
  header: ReactNode
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
// up/down buttons around each slot. The whole panel, including its pinned
// Submit/Skip footer, owns the keyboard (see Panel), so the game's own key
// handlers (see input.ts) ignore keys typed here.
export function InitialsEntry({ title, header, start, busy, error, onSubmit, onSkip }: Props) {
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


  const actions = (
    <>
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
    </>
  )

  return (
    <Panel title={title} actions={actions} ownsKeys onKeyDown={onKeyDown}>
      {header}
      <p className="mt-2 text-sm text-slate-300">Enter your initials for the Top 10.</p>
      <div className="mt-3 flex justify-center gap-2">
        {SLOTS.map((index) => (
          <LetterSlot
            key={index}
            index={index}
            letter={letters[index]}
            active={index === active}
            slotRef={(element) => {
              slots.current[index] = element
            }}
            onFocus={() => setActive(index)}
            onCycle={(by) => cycle(index, by)}
          />
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
    </Panel>
  )
}
