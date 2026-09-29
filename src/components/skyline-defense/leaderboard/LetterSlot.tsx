import type { Ref } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'

type Props = {
  index: number
  letter: string
  active: boolean
  slotRef: Ref<HTMLDivElement>
  onFocus: () => void
  // Cycle this slot's letter: +1 next, -1 previous.
  onCycle: (by: 1 | -1) => void
}

const A = 'A'.charCodeAt(0)

// One initials slot: a 44px up button, the letter (a spinbutton; the active
// one blinks like a cursor, steady under reduced motion), a 44px down button.
export function LetterSlot({ index, letter, active, slotRef, onFocus, onCycle }: Props) {
  const arrow = (by: 1 | -1) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={`${by > 0 ? 'Next' : 'Previous'} letter for initial ${index + 1}`}
      onClick={() => onCycle(by)}
      className="flex size-11 items-center justify-center rounded-lg text-[var(--laser-cyan)] transition-colors hover:bg-[var(--laser-cyan)]/10 focus-visible:outline-2 focus-visible:outline-[var(--laser-cyan)]"
    >
      <HugeiconsIcon icon={by > 0 ? ArrowUp01Icon : ArrowDown01Icon} strokeWidth={2} className="size-6" aria-hidden="true" />
    </button>
  )
  return (
    <div className="flex flex-col items-center">
      {arrow(1)}
      <div
        ref={slotRef}
        role="spinbutton"
        tabIndex={0}
        aria-label={`Initial ${index + 1} of 3`}
        aria-valuenow={letter.charCodeAt(0) - A + 1}
        aria-valuemin={1}
        aria-valuemax={26}
        aria-valuetext={letter}
        onFocus={onFocus}
        className={`flex h-14 w-12 items-center justify-center rounded-lg border-2 bg-[var(--deep-space-black)]/60 [font-family:var(--mono)] text-3xl font-bold text-slate-50 outline-none ${
          active
            ? 'animate-[initials-blink_1s_steps(1)_infinite] border-[var(--laser-cyan)] motion-reduce:animate-none'
            : 'border-[var(--cyber-purple)]/50'
        }`}
      >
        {letter}
      </div>
      {arrow(-1)}
    </div>
  )
}
