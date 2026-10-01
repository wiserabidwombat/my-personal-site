import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'

type Props = {
  direction: 'back' | 'forward'
  // False once this side can't scroll further: the button hides.
  enabled: boolean
  onClick: () => void
}

// Prev/next button for PhoneScreenshots, on the strip's edge. Only shown
// where a mouse wheel can't scroll sideways (a fine pointer that can hover);
// touch devices swipe. Outlined and restrained, no glow.
const buttonClass = cn(
  'absolute top-[calc(50%-1rem)] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full',
  'border border-[var(--laser-cyan)]/50 bg-[var(--deep-space-black)]/80 text-[var(--laser-cyan)] backdrop-blur-sm',
  'transition-[opacity,visibility,background-color,border-color] duration-200 [@media(hover:hover)_and_(pointer:fine)]:flex',
  'hover:border-[var(--laser-cyan)] hover:bg-[var(--laser-cyan)]/10',
  'focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep-space-black)] focus-visible:outline-none',
)

export function StripScrollButton({ direction, enabled, onClick }: Props) {
  const back = direction === 'back'
  return (
    <button
      type="button"
      aria-label={back ? 'Previous screenshot' : 'Next screenshot'}
      data-scroll={direction}
      onClick={onClick}
      className={cn(buttonClass, back ? 'left-2' : 'right-2', !enabled && 'invisible opacity-0')}
    >
      <HugeiconsIcon icon={back ? ArrowLeft01Icon : ArrowRight01Icon} strokeWidth={2} className="size-5" aria-hidden="true" />
    </button>
  )
}
