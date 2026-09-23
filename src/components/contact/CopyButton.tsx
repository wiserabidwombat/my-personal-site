import { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

type Props = {
  text: string
  label: string // accessible name, e.g. "Copy email address"
}

const CONFIRM_MS = 2000

// Copies `text` and confirms for ~2s with a small bubble above the button
// (so the card's text doesn't reflow). The confirmation is also announced
// through an always-mounted polite live region.
export function CopyButton({ text, label }: Props) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus('idle'), CONFIRM_MS)
  }

  const message = status === 'copied' ? 'Copied!' : status === 'failed' ? 'Copy failed' : ''

  return (
    <div className="relative">
      <span
        role="status"
        className={cn(
          'pointer-events-none absolute right-0 bottom-full mb-2 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
          message
            ? 'border-[var(--laser-cyan)]/50 bg-[var(--deep-space-black)] text-[var(--laser-cyan)]'
            : 'border-transparent',
        )}
      >
        {message}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={label}
        title={label}
        className="flex size-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-[var(--laser-cyan)]/10 hover:text-[var(--laser-cyan)] focus-visible:ring-2 focus-visible:ring-[var(--laser-cyan)] focus-visible:outline-none"
      >
        <HugeiconsIcon
          icon={status === 'copied' ? Tick02Icon : Copy01Icon}
          strokeWidth={2}
          className="size-4"
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
