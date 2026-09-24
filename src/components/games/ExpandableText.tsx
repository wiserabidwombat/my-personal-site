import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from 'cn'

type Props = {
  text: string
  className?: string
}

// Clamped to ~4 lines with a Show more / Show less toggle. The toggle only
// appears when the text actually overflows the clamp, measured after
// render, so short descriptions don't get a useless button.
export function ExpandableText({ text, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    // Only meaningful while clamped; once expanded, keep the toggle.
    if (el && !expanded) setOverflows(el.scrollHeight > el.clientHeight + 1)
  }, [text, expanded])

  return (
    <div className={className}>
      <p ref={ref} className={cn('whitespace-pre-line', !expanded && 'line-clamp-4')}>
        {text}
      </p>
      {(overflows || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="mt-1.5 text-xs font-medium text-[var(--laser-cyan)] underline-offset-4 hover:underline"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
